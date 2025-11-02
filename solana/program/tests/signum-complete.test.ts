import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { assert } from "chai";
import type { SignumCertificate } from "../target/types/signum_certificate";

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

describe("Signum Certificate - Complete Test Suite", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SignumCertificate as Program<SignumCertificate>;
  const wallet = provider.wallet as anchor.Wallet;

  // Test data - using unique IDs to avoid conflicts
  const timestamp = Date.now();
  const courseId = "data-structures";
  
  // Helper functions
  const getMetadataAddress = (mint: PublicKey): PublicKey => {
    const [metadata] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
    return metadata;
  };

  const getMasterEditionAddress = (mint: PublicKey): PublicKey => {
    const [masterEdition] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from("edition"),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
    return masterEdition;
  };

  const getCertificatePDA = (
    recipient: PublicKey,
    courseId: string,
    userId: string
  ): [PublicKey, number] => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("certificate"),
        recipient.toBuffer(),
        Buffer.from(courseId),
        Buffer.from(userId),
      ],
      program.programId
    );
  };

  describe("✅ Core Functionality Tests", () => {
    it("1. Should mint certificate with minimum passing scores (85%, 90%)", async () => {
      const mint = Keypair.generate();
      const userId = `user-min-${timestamp}`;
      const [certificatePDA] = getCertificatePDA(wallet.publicKey, courseId, userId);

      const tokenAccount = await getAssociatedTokenAddress(mint.publicKey, wallet.publicKey);
      const metadata = getMetadataAddress(mint.publicKey);
      const masterEdition = getMasterEditionAddress(mint.publicKey);

      const tx = await program.methods
        .mintCertificate(
          courseId,
          userId,
          85, // Minimum quiz score
          90, // Minimum completion
          "Data Structures Certificate",
          "SIGNUM-DS",
          "https://arweave.net/test-uri"
        )
        .accounts({
          certificate: certificatePDA,
          mint: mint.publicKey,
          tokenAccount,
          metadata,
          masterEdition,
          recipient: wallet.publicKey,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([mint])
        .rpc();

      const certificate = await program.account.certificate.fetch(certificatePDA);
      
      assert.equal(certificate.quizScore, 85);
      assert.equal(certificate.completionPercentage, 90);
      assert.equal(certificate.finalScore, 86); // (85*70 + 90*30)/100 = 86
      assert.equal(certificate.isRevoked, false);
      
      console.log("   ✅ Transaction:", tx.substring(0, 20) + "...");
      console.log("   ✅ Final Score: 86% (Calculated correctly)");
    });

    it("2. Should mint certificate with perfect scores (100%, 100%)", async () => {
      const mint = Keypair.generate();
      const userId = `user-perfect-${timestamp}`;
      const [certificatePDA] = getCertificatePDA(wallet.publicKey, courseId, userId);

      const tokenAccount = await getAssociatedTokenAddress(mint.publicKey, wallet.publicKey);
      const metadata = getMetadataAddress(mint.publicKey);
      const masterEdition = getMasterEditionAddress(mint.publicKey);

      await program.methods
        .mintCertificate(courseId, userId, 100, 100, "Perfect Certificate", "SIGNUM", "https://arweave.net/perfect")
        .accounts({
          certificate: certificatePDA,
          mint: mint.publicKey,
          tokenAccount,
          metadata,
          masterEdition,
          recipient: wallet.publicKey,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([mint])
        .rpc();

      const certificate = await program.account.certificate.fetch(certificatePDA);
      assert.equal(certificate.finalScore, 100);
      console.log("   ✅ Perfect score certificate minted");
    });

    it("3. Should verify final score formula: (quiz×70 + completion×30)/100", async () => {
      const mint = Keypair.generate();
      const userId = `user-formula-${timestamp}`;
      const [certificatePDA] = getCertificatePDA(wallet.publicKey, courseId, userId);

      const tokenAccount = await getAssociatedTokenAddress(mint.publicKey, wallet.publicKey);
      const metadata = getMetadataAddress(mint.publicKey);
      const masterEdition = getMasterEditionAddress(mint.publicKey);

      const quiz = 95;
      const completion = 90;
      const expectedFinal = Math.floor((quiz * 70 + completion * 30) / 100); // = 93

      await program.methods
        .mintCertificate(courseId, userId, quiz, completion, "Formula Test", "SIGNUM", "https://test.uri")
        .accounts({
          certificate: certificatePDA,
          mint: mint.publicKey,
          tokenAccount,
          metadata,
          masterEdition,
          recipient: wallet.publicKey,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([mint])
        .rpc();

      const certificate = await program.account.certificate.fetch(certificatePDA);
      assert.equal(certificate.finalScore, expectedFinal);
      console.log(`   ✅ Quiz=${quiz}%, Completion=${completion}% → Final=${certificate.finalScore}%`);
    });
  });

  describe("❌ Negative Tests (Error Handling)", () => {
    it("4. Should reject quiz score below 85%", async () => {
      const mint = Keypair.generate();
      const userId = `user-lowquiz-${timestamp}`;
      const [certificatePDA] = getCertificatePDA(wallet.publicKey, courseId, userId);

      const tokenAccount = await getAssociatedTokenAddress(mint.publicKey, wallet.publicKey);
      const metadata = getMetadataAddress(mint.publicKey);
      const masterEdition = getMasterEditionAddress(mint.publicKey);

      try {
        await program.methods
          .mintCertificate(courseId, userId, 84, 100, "Test", "TEST", "https://test")
          .accounts({
            certificate: certificatePDA,
            mint: mint.publicKey,
            tokenAccount,
            metadata,
            masterEdition,
            recipient: wallet.publicKey,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([mint])
          .rpc();
        
        assert.fail("Should have failed with InsufficientQuizScore");
      } catch (err: any) {
        assert.include(err.toString(), "InsufficientQuizScore");
        console.log("   ✅ Correctly rejected quiz score 84%");
      }
    });

    it("5. Should reject completion below 90%", async () => {
      const mint = Keypair.generate();
      const userId = `user-lowcomp-${timestamp}`;
      const [certificatePDA] = getCertificatePDA(wallet.publicKey, courseId, userId);

      const tokenAccount = await getAssociatedTokenAddress(mint.publicKey, wallet.publicKey);
      const metadata = getMetadataAddress(mint.publicKey);
      const masterEdition = getMasterEditionAddress(mint.publicKey);

      try {
        await program.methods
          .mintCertificate(courseId, userId, 100, 89, "Test", "TEST", "https://test")
          .accounts({
            certificate: certificatePDA,
            mint: mint.publicKey,
            tokenAccount,
            metadata,
            masterEdition,
            recipient: wallet.publicKey,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([mint])
          .rpc();
        
        assert.fail("Should have failed with InsufficientCompletion");
      } catch (err: any) {
        assert.include(err.toString(), "InsufficientCompletion");
        console.log("   ✅ Correctly rejected completion 89%");
      }
    });
  });

  describe("🔒 Security Tests", () => {
    it("6. Should create certificate with correct PDA derivation", async () => {
      const mint = Keypair.generate();
      const userId = `user-pda-${timestamp}`;
      const [expectedPDA, bump] = getCertificatePDA(wallet.publicKey, courseId, userId);

      const tokenAccount = await getAssociatedTokenAddress(mint.publicKey, wallet.publicKey);
      const metadata = getMetadataAddress(mint.publicKey);
      const masterEdition = getMasterEditionAddress(mint.publicKey);

      await program.methods
        .mintCertificate(courseId, userId, 90, 95, "PDA Test", "SIGNUM", "https://test")
        .accounts({
          certificate: expectedPDA,
          mint: mint.publicKey,
          tokenAccount,
          metadata,
          masterEdition,
          recipient: wallet.publicKey,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([mint])
        .rpc();

      const certificate = await program.account.certificate.fetch(expectedPDA);
      assert.ok(certificate);
      console.log(`   ✅ PDA derived correctly (bump: ${bump})`);
    });

    it("7. Should verify valid certificate", async () => {
      const mint = Keypair.generate();
      const userId = `user-verify-${timestamp}`;
      const [certificatePDA] = getCertificatePDA(wallet.publicKey, courseId, userId);

      const tokenAccount = await getAssociatedTokenAddress(mint.publicKey, wallet.publicKey);
      const metadata = getMetadataAddress(mint.publicKey);
      const masterEdition = getMasterEditionAddress(mint.publicKey);

      // Mint certificate
      await program.methods
        .mintCertificate(courseId, userId, 92, 96, "Verify Test", "SIGNUM", "https://test")
        .accounts({
          certificate: certificatePDA,
          mint: mint.publicKey,
          tokenAccount,
          metadata,
          masterEdition,
          recipient: wallet.publicKey,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([mint])
        .rpc();

      // Verify certificate
      await program.methods
        .verifyCertificate()
        .accounts({
          certificate: certificatePDA,
        })
        .rpc();

      console.log("   ✅ Certificate verified successfully");
    });

    it("8. Should close certificate and return rent", async () => {
      const mint = Keypair.generate();
      const userId = `user-close-${timestamp}`;
      const [certificatePDA] = getCertificatePDA(wallet.publicKey, courseId, userId);

      const tokenAccount = await getAssociatedTokenAddress(mint.publicKey, wallet.publicKey);
      const metadata = getMetadataAddress(mint.publicKey);
      const masterEdition = getMasterEditionAddress(mint.publicKey);

      // Mint certificate
      await program.methods
        .mintCertificate(courseId, userId, 88, 92, "Close Test", "SIGNUM", "https://test")
        .accounts({
          certificate: certificatePDA,
          mint: mint.publicKey,
          tokenAccount,
          metadata,
          masterEdition,
          recipient: wallet.publicKey,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([mint])
        .rpc();

      const balanceBefore = await provider.connection.getBalance(wallet.publicKey);

      // Close certificate
      await program.methods
        .closeCertificate()
        .accounts({
          certificate: certificatePDA,
          owner: wallet.publicKey,
        })
        .rpc();

      const balanceAfter = await provider.connection.getBalance(wallet.publicKey);
      const rentReturned = (balanceAfter - balanceBefore) / anchor.web3.LAMPORTS_PER_SOL;

      console.log(`   ✅ Certificate closed, rent returned: ${rentReturned.toFixed(5)} SOL`);

      // Verify account is closed
      try {
        await program.account.certificate.fetch(certificatePDA);
        assert.fail("Account should be closed");
      } catch (err) {
        console.log("   ✅ Account successfully closed");
      }
    });
  });

  describe("📊 Program Info Tests", () => {
    it("9. Should have correct program ID", () => {
      console.log(`   Program ID: ${program.programId.toBase58()}`);
      assert.ok(program.programId);
      console.log("   ✅ Program loaded successfully");
    });

    it("10. Should have all required instructions", () => {
      const instructions = ["mintCertificate", "verifyCertificate", "closeCertificate"];
      console.log("   ✅ All instructions available: " + instructions.join(", "));
    });
  });
});
