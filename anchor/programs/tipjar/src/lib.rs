#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("8bfHPDePiZfE8WmqXgxzEbswtZKWyNwViWXHHM3953WY");

#[program]
pub mod tipjar {
    use super::*;

    pub fn initialize_tipjar(
        ctx: Context<InitializeTipjar>,
        name: String,
        description: String,
        timestamp: i64,
    ) -> Result<()> {
        let tip_jar = &mut ctx.accounts.tip_jar;

        tip_jar.authority = ctx.accounts.authority.key();
        tip_jar.name = name;
        tip_jar.description = description;
        tip_jar.total_tips = 0;
        tip_jar.tip_count = 0;
        tip_jar.timestamp = timestamp;
        tip_jar.unique_id = timestamp as u64; // Use timestamp as unique ID
        tip_jar.bump = ctx.bumps.tip_jar;

        Ok(())
    }

    pub fn send_tip(ctx: Context<SendTip>, amount: u64, message: String) -> Result<()> {
        require!(amount > 0, TipJarError::InvalidTipAmount);

        let tip_jar = &mut ctx.accounts.tip_jar;
        let tipper = &ctx.accounts.tipper;

        // Transfer SOL from tipper to tip_jar PDA
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: tipper.to_account_info(),
                to: tip_jar.to_account_info(),
            },
        );

        system_program::transfer(cpi_context, amount)?;

        // Update stats
        tip_jar.total_tips = tip_jar.total_tips.checked_add(amount).unwrap();
        tip_jar.tip_count = tip_jar.tip_count.checked_add(1).unwrap();

        emit!(TipEvent {
            tipper: tipper.key(),
            tip_jar: tip_jar.key(),
            amount,
            message,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn withdraw_tip(ctx: Context<WithdrawTip>, amount: u64) -> Result<()> {
        let tip_jar = &mut ctx.accounts.tip_jar;
        let authority = &ctx.accounts.authority;
    
        // Check authorization
        require!(
            tip_jar.authority == authority.key(),
            TipJarError::NotAuthorized
        );
    
        // Check if tip jar has enough balance
        require!(
            tip_jar.to_account_info().lamports() >= amount,
            TipJarError::InsufficientFunds
        );
    
        // Transfer lamports manually
        **tip_jar.to_account_info().try_borrow_mut_lamports()? -= amount;
        **authority.to_account_info().try_borrow_mut_lamports()? += amount;

        // Update the total_tips to reflect the withdrawal
        tip_jar.total_tips = tip_jar.total_tips.saturating_sub(amount);
    
        Ok(())
    }

    pub fn delete_tip_jar(ctx: Context<DeleteTipJar>) -> Result<()> {
        let tip_jar = &mut ctx.accounts.tip_jar;
        let authority = &ctx.accounts.authority;

        // Check authorization
        require!(
            tip_jar.authority == authority.key(),
            TipJarError::NotAuthorized
        );

        // Close the account and transfer rent to authority
        let authority_key = authority.key();
        let seeds = &[
            b"tip_jar",
            authority_key.as_ref(),
            &tip_jar.unique_id.to_le_bytes(),
            &[tip_jar.bump],
        ];
        let _signer = &[&seeds[..]];

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeTipjar<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    pub timestamp: i64,

    #[account(
        init,
        payer = authority,
        space = 8 + TipJar::INIT_SPACE,
        seeds = [b"tip_jar", authority.key().as_ref(), &timestamp.to_le_bytes()],
        bump
    )]
    pub tip_jar: Account<'info, TipJar>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SendTip<'info> {
    #[account(mut)]
    pub tipper: Signer<'info>,

    #[account(
        mut,
        seeds = [b"tip_jar", tip_jar.authority.as_ref(), &tip_jar.unique_id.to_le_bytes()],
        bump = tip_jar.bump
    )]
    pub tip_jar: Account<'info, TipJar>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawTip<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"tip_jar", authority.key().as_ref(), &tip_jar.unique_id.to_le_bytes()],
        bump = tip_jar.bump
    )]
    pub tip_jar: Account<'info, TipJar>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DeleteTipJar<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"tip_jar", authority.key().as_ref(), &tip_jar.unique_id.to_le_bytes()],
        bump = tip_jar.bump,
        close = authority
    )]
    pub tip_jar: Account<'info, TipJar>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct TipJar {
    pub authority: Pubkey,

    #[max_len(32)]
    pub name: String,

    #[max_len(128)]
    pub description: String,

    pub total_tips: u64,
    pub tip_count: u64,
    pub timestamp: i64,
    pub unique_id: u64,

    pub bump: u8,
}

#[event]
pub struct TipEvent {
    pub tipper: Pubkey,
    pub tip_jar: Pubkey,
    pub amount: u64,
    pub message: String,
    pub timestamp: i64,
}

#[error_code]
pub enum TipJarError {
    #[msg("Not authorized")]
    NotAuthorized,

    #[msg("Tip amount must be greater than zero")]
    InvalidTipAmount,

    #[msg("Insufficient funds in tip jar")]
    InsufficientFunds,

    #[msg("Tip jar must be empty before deletion")]
    TipJarNotEmpty,
}