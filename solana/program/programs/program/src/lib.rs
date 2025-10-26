use anchor_lang::{
    prelude::*,
    solana_program::program::invoke,
};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, MintTo, Token, TokenAccount},
};
use mpl_token_metadata::{
    ID as TOKEN_METADATA_ID,
    instructions::{
        CreateMasterEditionV3Builder,
        CreateMetadataAccountV3Builder,
    },
    types::DataV2,
};

declare_id!("2EWf5TXq3jW8iQ1yuQorrgmaBc4Wjd8PMwDEBCWod5tp");

#[program]
pub mod signum_certificate {
    use super::*;

    pub fn mint_certificate(
        ctx: Context<MintCertificate>,
        course_id: String,
        user_id: String,
        quiz_score: u8,
        completion_percentage: u8,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        require!(quiz_score >= 85, ErrorCode::InsufficientQuizScore);
        require!(completion_percentage >= 90, ErrorCode::InsufficientCompletion);

        let final_score = ((quiz_score as u16 * 70 + completion_percentage as u16 * 30) / 100) as u8;

        let certificate = &mut ctx.accounts.certificate;
        certificate.owner = ctx.accounts.recipient.key();
        certificate.course_id = course_id.clone();
        certificate.user_id = user_id;
        certificate.quiz_score = quiz_score;
        certificate.completion_percentage = completion_percentage;
        certificate.final_score = final_score;
        certificate.mint_address = ctx.accounts.mint.key();
        certificate.minted_at = Clock::get()?.unix_timestamp;
        certificate.is_revoked = false;

        token::mint_to(ctx.accounts.mint_to_ctx(), 1)?;

        let data = DataV2 {
            name,
            symbol,
            uri,
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        };

        let user_ai = ctx.accounts.recipient.to_account_info();

        let metadata_ix = CreateMetadataAccountV3Builder::new()
            .metadata(ctx.accounts.metadata.key())
            .mint(ctx.accounts.mint.key())
            .mint_authority(ctx.accounts.recipient.key())
            .payer(ctx.accounts.recipient.key())
            .update_authority(ctx.accounts.recipient.key(), true)
            .data(data)
            .is_mutable(true)
            .instruction();

        invoke(
            &metadata_ix,
            &[
                ctx.accounts.token_metadata_program.to_account_info(),
                ctx.accounts.metadata.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                user_ai.clone(),
                user_ai.clone(),
                user_ai.clone(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.rent.to_account_info(),
            ],
        )?;

        let me_ix = CreateMasterEditionV3Builder::new()
            .edition(ctx.accounts.master_edition.key())
            .mint(ctx.accounts.mint.key())
            .payer(ctx.accounts.recipient.key())
            .mint_authority(ctx.accounts.recipient.key())
            .update_authority(ctx.accounts.recipient.key())
            .metadata(ctx.accounts.metadata.key())
            .max_supply(0)
            .instruction();

        invoke(
            &me_ix,
            &[
                ctx.accounts.token_metadata_program.to_account_info(),
                ctx.accounts.master_edition.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                user_ai.clone(),
                user_ai.clone(),
                user_ai.clone(),
                ctx.accounts.metadata.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.rent.to_account_info(),
            ],
        )?;

        msg!("✅ Certificate minted: {}, Score: {}%", course_id, final_score);
        Ok(())
    }

    pub fn verify_certificate(ctx: Context<VerifyCertificate>) -> Result<()> {
        let certificate = &ctx.accounts.certificate;
        require!(!certificate.is_revoked, ErrorCode::CertificateRevoked);
        msg!("✅ Certificate verified: {}", certificate.course_id);
        Ok(())
    }
    
    /// Close certificate account (for testing only)
    /// Returns rent to the owner
    pub fn close_certificate(ctx: Context<CloseCertificate>) -> Result<()> {
        msg!("🗑️ Closing certificate for course: {}", ctx.accounts.certificate.course_id);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(course_id: String, user_id: String)]
pub struct MintCertificate<'info> {
    #[account(
        init,
        payer = recipient,
        space = 8 + Certificate::SIZE,
        seeds = [b"certificate", recipient.key().as_ref(), course_id.as_bytes(), user_id.as_bytes()],
        bump
    )]
    pub certificate: Account<'info, Certificate>,

    #[account(
        init,
        payer = recipient,
        mint::decimals = 0,
        mint::authority = recipient,
        mint::freeze_authority = recipient
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = recipient,
        associated_token::mint = mint,
        associated_token::authority = recipient,
    )]
    pub token_account: Account<'info, TokenAccount>,

    /// CHECK: Metaplex metadata PDA
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    /// CHECK: Metaplex master edition PDA
    #[account(mut)]
    pub master_edition: UncheckedAccount<'info>,

    #[account(mut)]
    pub recipient: Signer<'info>,

    /// CHECK: Metaplex Token Metadata Program
    #[account(address = TOKEN_METADATA_ID)]
    pub token_metadata_program: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> MintCertificate<'info> {
    pub fn mint_to_ctx(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            MintTo {
                mint: self.mint.to_account_info(),
                to: self.token_account.to_account_info(),
                authority: self.recipient.to_account_info(),
            },
        )
    }
}

#[derive(Accounts)]
pub struct VerifyCertificate<'info> {
    pub certificate: Account<'info, Certificate>,
}

#[derive(Accounts)]
#[instruction()]
pub struct CloseCertificate<'info> {
    #[account(
        mut,
        close = owner,
        has_one = owner
    )]
    pub certificate: Account<'info, Certificate>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[account]
pub struct Certificate {
    pub owner: Pubkey,
    pub course_id: String,
    pub user_id: String,
    pub quiz_score: u8,
    pub completion_percentage: u8,
    pub final_score: u8,
    pub mint_address: Pubkey,
    pub minted_at: i64,
    pub is_revoked: bool,
}

impl Certificate {
    pub const SIZE: usize = 32 + 36 + 68 + 1 + 1 + 1 + 32 + 8 + 1;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Quiz score must be at least 85%")]
    InsufficientQuizScore,
    #[msg("Course completion must be at least 90%")]
    InsufficientCompletion,
    #[msg("Certificate has been revoked")]
    CertificateRevoked,
}
