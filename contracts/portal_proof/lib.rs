#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod portal_proof {
    use ink::prelude::string::String;
    use ink::storage::Mapping;

    #[derive(
        Debug, Clone, Copy, PartialEq, Eq, scale::Encode, scale::Decode, scale_info::TypeInfo,
    )]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout))]
    pub enum ProofStatus {
        Pending,
        Confirmed,
        Disputed,
        Revoked,
    }

    #[derive(Clone, PartialEq, Eq, scale::Encode, scale::Decode, scale_info::TypeInfo)]
    #[cfg_attr(feature = "std", derive(Debug, ink::storage::traits::StorageLayout))]
    pub struct ProofRecord {
        pub id: u64,
        pub issuer: AccountId,
        pub recipient: AccountId,
        pub title: String,
        pub record_type: String,
        pub metadata_uri: String,
        pub reference: String,
        pub status: ProofStatus,
        pub created_at: Timestamp,
        pub updated_at: Timestamp,
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode, scale_info::TypeInfo)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout))]
    pub enum Error {
        NotFound,
        OnlyIssuer,
        OnlyRecipient,
        AlreadyFinal,
        EmptyField,
    }

    pub type Result<T> = core::result::Result<T, Error>;

    #[ink(storage)]
    pub struct PortalProof {
        next_id: u64,
        records: Mapping<u64, ProofRecord>,
    }

    #[ink(event)]
    pub struct ProofCreated {
        #[ink(topic)]
        id: u64,
        #[ink(topic)]
        issuer: AccountId,
        #[ink(topic)]
        recipient: AccountId,
    }

    #[ink(event)]
    pub struct ProofStatusChanged {
        #[ink(topic)]
        id: u64,
        status: ProofStatus,
    }

    impl PortalProof {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                next_id: 1,
                records: Mapping::default(),
            }
        }

        #[ink(message)]
        pub fn create_record(
            &mut self,
            recipient: AccountId,
            title: String,
            record_type: String,
            metadata_uri: String,
            reference: String,
        ) -> Result<u64> {
            if title.is_empty() || record_type.is_empty() || metadata_uri.is_empty() {
                return Err(Error::EmptyField);
            }

            let id = self.next_id;
            self.next_id = self.next_id.saturating_add(1);

            let caller = self.env().caller();
            let now = self.env().block_timestamp();
            let record = ProofRecord {
                id,
                issuer: caller,
                recipient,
                title,
                record_type,
                metadata_uri,
                reference,
                status: ProofStatus::Pending,
                created_at: now,
                updated_at: now,
            };

            self.records.insert(id, &record);
            self.env().emit_event(ProofCreated {
                id,
                issuer: caller,
                recipient,
            });

            Ok(id)
        }

        #[ink(message)]
        pub fn confirm_record(&mut self, id: u64) -> Result<()> {
            self.set_status_as_recipient(id, ProofStatus::Confirmed)
        }

        #[ink(message)]
        pub fn dispute_record(&mut self, id: u64) -> Result<()> {
            self.set_status_as_recipient(id, ProofStatus::Disputed)
        }

        #[ink(message)]
        pub fn revoke_record(&mut self, id: u64) -> Result<()> {
            let mut record = self.records.get(id).ok_or(Error::NotFound)?;
            if self.env().caller() != record.issuer {
                return Err(Error::OnlyIssuer);
            }
            if record.status == ProofStatus::Confirmed {
                return Err(Error::AlreadyFinal);
            }

            record.status = ProofStatus::Revoked;
            record.updated_at = self.env().block_timestamp();
            self.records.insert(id, &record);
            self.env().emit_event(ProofStatusChanged {
                id,
                status: ProofStatus::Revoked,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn get_record(&self, id: u64) -> Option<ProofRecord> {
            self.records.get(id)
        }

        #[ink(message)]
        pub fn next_record_id(&self) -> u64 {
            self.next_id
        }

        fn set_status_as_recipient(&mut self, id: u64, status: ProofStatus) -> Result<()> {
            let mut record = self.records.get(id).ok_or(Error::NotFound)?;
            if self.env().caller() != record.recipient {
                return Err(Error::OnlyRecipient);
            }
            if matches!(record.status, ProofStatus::Confirmed | ProofStatus::Revoked) {
                return Err(Error::AlreadyFinal);
            }

            record.status = status;
            record.updated_at = self.env().block_timestamp();
            self.records.insert(id, &record);
            self.env().emit_event(ProofStatusChanged { id, status });

            Ok(())
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        fn accounts() -> ink::env::test::DefaultAccounts<ink::env::DefaultEnvironment> {
            ink::env::test::default_accounts::<ink::env::DefaultEnvironment>()
        }

        #[ink::test]
        fn issuer_can_create_record() {
            let accounts = accounts();
            let mut contract = PortalProof::new();
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);

            let id = contract
                .create_record(
                    accounts.bob,
                    "Solar inverter delivery".into(),
                    "Physical delivery".into(),
                    "ipfs://solar-delivery".into(),
                    "INV-100".into(),
                )
                .expect("record should be created");

            let record = contract.get_record(id).expect("record should exist");
            assert_eq!(record.issuer, accounts.alice);
            assert_eq!(record.recipient, accounts.bob);
            assert_eq!(record.status, ProofStatus::Pending);
        }

        #[ink::test]
        fn recipient_can_confirm_record() {
            let accounts = accounts();
            let mut contract = PortalProof::new();
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            let id = contract
                .create_record(
                    accounts.bob,
                    "Warehouse title certificate".into(),
                    "RWA certificate".into(),
                    "ipfs://warehouse-title".into(),
                    "RWA-8891".into(),
                )
                .expect("record should be created");

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            assert_eq!(contract.confirm_record(id), Ok(()));

            let record = contract.get_record(id).expect("record should exist");
            assert_eq!(record.status, ProofStatus::Confirmed);
        }

        #[ink::test]
        fn non_recipient_cannot_confirm_record() {
            let accounts = accounts();
            let mut contract = PortalProof::new();
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            let id = contract
                .create_record(
                    accounts.bob,
                    "Delivery receipt".into(),
                    "Physical delivery".into(),
                    "ipfs://delivery".into(),
                    "POD-1".into(),
                )
                .expect("record should be created");

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.charlie);
            assert_eq!(contract.confirm_record(id), Err(Error::OnlyRecipient));
        }

        #[ink::test]
        fn recipient_can_dispute_record() {
            let accounts = accounts();
            let mut contract = PortalProof::new();
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            let id = contract
                .create_record(
                    accounts.bob,
                    "Disputed delivery".into(),
                    "Physical delivery".into(),
                    "ipfs://damaged-delivery".into(),
                    "POD-2".into(),
                )
                .expect("record should be created");

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            assert_eq!(contract.dispute_record(id), Ok(()));

            let record = contract.get_record(id).expect("record should exist");
            assert_eq!(record.status, ProofStatus::Disputed);
        }

        #[ink::test]
        fn issuer_can_revoke_pending_record() {
            let accounts = accounts();
            let mut contract = PortalProof::new();
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            let id = contract
                .create_record(
                    accounts.bob,
                    "Revocable certificate".into(),
                    "RWA certificate".into(),
                    "ipfs://revocable-certificate".into(),
                    "RWA-1".into(),
                )
                .expect("record should be created");

            assert_eq!(contract.revoke_record(id), Ok(()));

            let record = contract.get_record(id).expect("record should exist");
            assert_eq!(record.status, ProofStatus::Revoked);
        }

        #[ink::test]
        fn confirmed_record_is_final() {
            let accounts = accounts();
            let mut contract = PortalProof::new();
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            let id = contract
                .create_record(
                    accounts.bob,
                    "Final certificate".into(),
                    "RWA certificate".into(),
                    "ipfs://final-certificate".into(),
                    "RWA-2".into(),
                )
                .expect("record should be created");

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);
            assert_eq!(contract.confirm_record(id), Ok(()));

            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            assert_eq!(contract.revoke_record(id), Err(Error::AlreadyFinal));
        }

        #[ink::test]
        fn empty_required_fields_are_rejected() {
            let accounts = accounts();
            let mut contract = PortalProof::new();
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);

            assert_eq!(
                contract.create_record(
                    accounts.bob,
                    "".into(),
                    "Physical delivery".into(),
                    "ipfs://delivery".into(),
                    "POD-3".into(),
                ),
                Err(Error::EmptyField)
            );
        }
    }
}
