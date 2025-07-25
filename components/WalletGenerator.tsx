// change the tab space to 4 for better understanding 

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion"; 
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39"
import { ChevronDown, ChevronUp, Copy, Eye, EyeOff, Grid2X2, List, Trash } from "lucide-react";
import { derivePath } from "ed25519-hd-key";
import nacl from "tweetnacl";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { ethers } from "ethers";
import { 
	AlertDialog, 
	AlertDialogAction, 
	AlertDialogCancel, 
	AlertDialogContent, 
	AlertDialogDescription, 
	AlertDialogTitle, 
	AlertDialogTrigger, 
	AlertDialogFooter, 
	AlertDialogHeader 
} from "./ui/alert-dialog";
import Image from "next/image";


interface IWallet {
	publicKey: string;
	privateKey: string;
	mnemonic: string;
	path: string;
}


export const WalletGenerator = () => {

	const [path, setPath] = useState<string>("");
	const [wallets, setWallets] = useState<IWallet[]>([]);
	const [pathTypes, setPathTypes] = useState<string[]>([]);
	const [mnemonicInput, setMnemonicInput] = useState<string>("");
	const [mnemonicWords, setMnemonicWords] = useState<string[]>(Array(12).fill(""));
	const [showMnemonic, setShowMnemonic] = useState<boolean>(false);
	const [gridView, setGridView] = useState<boolean>(false);
	const [visiblePrivateKeys, setVisiblePrivateKeys] = useState<boolean[]>([]);
	const [visiblePhrases, setVisiblePhrases] = useState<boolean[]>([]);
	
	const pathTypeNames : {[key: string]: string} = {
		"501": "Solana",
		"60": "Ethereum"
	}
	const pathTypeName = pathTypeNames[path] || "";

	useEffect(() => {
		const storedWallets = localStorage.getItem("wallets");
        const storedMnemonic = localStorage.getItem("mnemonics");
        const storedPathTypes = localStorage.getItem("paths");

		if (storedWallets && storedMnemonic && storedPathTypes) {
        setMnemonicWords(JSON.parse(storedMnemonic));
        setWallets(JSON.parse(storedWallets));
        setPathTypes(JSON.parse(storedPathTypes));
        setVisiblePrivateKeys(JSON.parse(storedWallets).map(() => false));
        setVisiblePhrases(JSON.parse(storedWallets).map(() => false));
        }
	}, []);

	const generateWalletFromMnemonic = (
		pathType: string,
        mnemonic: string,
        accountIndex: number
	): IWallet | null => {
		
		try{
			const seedBuffer = mnemonicToSeedSync(mnemonic);
			const path = `m/44'/${pathType}'/0'/${accountIndex}'`;
			const { key: derivedSeed } = derivePath(path, seedBuffer.toString("hex"));

			let publicKeyEncoded: string;
            let privateKeyEncoded: string;

			if(pathType == "501"){
				// solana
				const { secretKey } = nacl.sign.keyPair.fromSeed(derivedSeed);
				const keyPair = Keypair.fromSecretKey(secretKey);

				privateKeyEncoded = bs58.encode(secretKey);
				publicKeyEncoded = keyPair.publicKey.toBase58();

			}else if(pathType == "60"){
				// ethereum
				const privateKey = Buffer.from(derivedSeed).toString("hex");
				privateKeyEncoded = privateKey;

				const wallet = new ethers.Wallet(privateKey);
				publicKeyEncoded = wallet.address;

			}else {
				toast.error("Unsupported path type.");
                return null;
			}

			return {
				publicKey: publicKeyEncoded,
				privateKey: privateKeyEncoded,
				mnemonic,
				path
			};
		}catch(error){
			toast.error("Failed to generate wallet. Please try again.");
			console.log(error);
            return null;
		}
	}

	const handleGenerateWallet = () => {
		let mnemonic = mnemonicInput.trim();

		if(mnemonic){
			if(!validateMnemonic(mnemonic)){
				toast.error("Invalid recovery phrase. Please try again.");
				return;
			}
		}
		else {
			mnemonic = generateMnemonic();
		}

		const words = mnemonic.split(" ");
		setMnemonicWords(words);

		const wallet = generateWalletFromMnemonic(
			path,
			mnemonicWords.join(" "),
			wallets.length
		);

		if(wallet){
			const updatedWallets = [...wallets, wallet];
			setWallets(updatedWallets);

			localStorage.setItem("wallets", JSON.stringify(updatedWallets));
			localStorage.setItem("mnemonics", JSON.stringify(words));
			localStorage.setItem("paths", JSON.stringify(pathTypes));	// eye
			
			setVisiblePrivateKeys([...visiblePrivateKeys, false]);
			setVisiblePhrases([...visiblePhrases, false]);

			toast.success("Wallet generated successfully!");
		}
	}
	
	const handleAddWallet = () => {
		if (!mnemonicWords) {
        toast.error("No mnemonic found. Please generate a wallet first.");
        return;
    }

		const wallet = generateWalletFromMnemonic(
            path,
            mnemonicWords.join(" "),
            wallets.length
        );

		if(wallet){
			const updatedWallets = [...wallets, wallet];
            const updatedPathType = [pathTypes, pathTypes];	// keep an eye on this
            setWallets(updatedWallets);

			localStorage.setItem("wallets", JSON.stringify(updatedWallets));
            localStorage.setItem("pathTypes", JSON.stringify(updatedPathType));

			setVisiblePrivateKeys([...visiblePrivateKeys, false]);
            setVisiblePhrases([...visiblePhrases, false]);

            toast.success("Wallet generated successfully!");
		}
	}

	const handleClearWallets = () => {
		localStorage.removeItem("wallets");
        localStorage.removeItem("mnemonics");
        localStorage.removeItem("paths");		
        localStorage.removeItem("path");

		setWallets([]);
        setMnemonicWords([]);
        setPathTypes([]);
        setVisiblePrivateKeys([]);
        setVisiblePhrases([]);

        toast.success("All wallets cleared.");
	}
	
	const handleDeleteWallet = (index: number) => {
		const updatedWallets = wallets.filter((_, i) => i !== index);
		const updatedPathTypes = pathTypes.filter((_, i) => i !== index);

		setWallets(updatedWallets);
        setPathTypes(updatedPathTypes);

		localStorage.setItem("wallets", JSON.stringify(updatedWallets));
        localStorage.setItem("paths", JSON.stringify(updatedPathTypes));	// eye

		setVisiblePrivateKeys(visiblePrivateKeys.filter((_, i) => i !== index));
        setVisiblePhrases(visiblePhrases.filter((_, i) => i !== index));

        toast.success("Wallet deleted successfully!");
	}

	const copyToClipboard = (content: string) => {
		navigator.clipboard.writeText(content);
		toast.success("copied to clipboard!");
	}

	const togglePrivateKeyVisibility = (index: number) => {
		setVisiblePrivateKeys(
			visiblePrivateKeys.map((visibility, i) => (i === index ? !visibility: visibility))
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{
				wallets.length === 0 && (
				<motion.div
					className="flex flex-col gap-4"
					initial={{opacity: 0, y: -20}}
					animate={{opacity: 1, y: 0}}
					transition={{
						duration: 0.3,
						ease: "easeInOut"
					}}
				>
					<div className="flex flex-col gap-4">
						{
							pathTypes.length === 0 && (
							<motion.div
								className="flex gap-4 flex-col my-12"
								initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                duration: 0.3,
                                ease: "easeInOut",
                                }}
							>
								<div className="flex flex-col gap-2">
									<h1 className="tracking-tighter text-4xl md:text-5xl font-black">
                                        Vault supports multiple blockchains
                                    </h1>
									<p className="text-primary/80 font-semibold text-lg md:text-xl">
                                        Choose a blockchain to get started.
                                    </p>
								</div>
								<div className="flex gap-2 pt-2">
									<Button
										size={"lg"}
										onClick={() => {
											setPath("501");
											setPathTypes(["501"]);
											toast.success(
                                                "Wallet selected. Please generate a wallet to continue."
                                            );
										}}
									>
										<Image src="/solana-sol-logo.svg" alt="sol icon" width={20} height={20}/>
										Solana
									</Button>
									<Button
										size={"lg"}
										onClick={() => {
											setPath("60");
											setPathTypes(["60"]);
											toast.success(
                                                "Wallet selected. Please generate a wallet to continue."
                                            );
										}}
									>
										<Image src="/ethereum-eth-logo.svg" alt="eth icon" width={15} height={15}/>
										Ethereum
									</Button>
								</div>
							</motion.div>
						)}
					</div>
				</motion.div>
			)}
			{
				pathTypes.length !== 0  && wallets.length === 0 && (
					<motion.div
						className="flex flex-col gap-4 my-12"
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							duration: 0.3,
							ease: "easeInOut",
						}}
					>
						<div className="flex flex-col gap-2">
							<h1 className="tracking-tighter text-4xl md:text-5xl font-black">
								Secret Recovery Phrase
							</h1>
							<p className="text-primary/80 font-semibold text-lg md:text-xl">
								Save these words in a safe place.
							</p>
						</div>
						<div className="flex flex-col md:flex-row gap-4">
							<Input
								type="password"
								placeholder="Enter your secret phrase (or leave blank to generate)"
								onChange={(e) => {setMnemonicInput(e.target.value)}}
								value={mnemonicInput}
							/>
							<Button size={"lg"} onClick={() => handleGenerateWallet()}>
								{mnemonicInput? "Add Wallet": "Generate Wallet"}
							</Button>
						</div>
					</motion.div>
				)
			}

			{/* Display Secret Phrase */}
			{
				mnemonicWords && wallets.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							duration: 0.3,
							ease: "easeInOut",
						}}
						className="group flex flex-col items-center gap-4 cursor-pointer rounded-lg border border-primary/10 p-8"
					>
						<div
							className="flex w-full justify-between items-center"
							onClick={() => setShowMnemonic(!showMnemonic)}
						>
							<h2 className="text-2xl md:text-3xl font-bold tracking-tighter">
								Your Secret Phrase
							</h2>
							<Button
								onClick={() => setShowMnemonic(!showMnemonic)}
								variant="ghost"
            	            >
								{showMnemonic ? (
									<ChevronUp className="size-4" />
								) : (
									<ChevronDown className="size-4" />
								)}
							</Button>
						</div>
						
						{
							showMnemonic && (
								<motion.div
									initial={{ opacity: 0, y: -20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										duration: 0.3,
										ease: "easeInOut",
									}}
									className="flex flex-col w-full items-center justify-center"
              		                onClick={() => copyToClipboard(mnemonicWords.join(" "))}
								>
									<motion.div
										initial={{ opacity: 0, y: -20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{
											duration: 0.3,
											ease: "easeInOut",
										}}
										className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-center w-full items-center mx-auto my-8"
									>
										{mnemonicWords.map((word, index) => (
											<p
												key={index}
												className="md:text-lg bg-foreground/5 hover:bg-foreground/10 transition-all duration-300 rounded-lg p-4"
											>
												{word}
											</p>
										))}
									</motion.div>
									<div className="text-sm md:text-base text-primary/50 flex w-full gap-2 items-center group-hover:text-primary/80 transition-all duration-300">
										<Copy className="size-4"/> Click Anyware to Copy
									</div>
								</motion.div>
							)
						}
					</motion.div>
				)
			}

			{/* Display Wallet Pairs */}
			{
				wallets.length > 0 && (
					<motion.div
						className="flex flex-col gap-8 mt-6"
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							delay: 0.3,
							duration: 0.3,
							ease: "easeInOut",
						}}
					>
						<div className="flex md:flex-row flex-col justify-between w-full gap-4 md:items-center">
							<h2 className="tracking-tighter text-3xl md:text-4xl font-extrabold">
								{pathTypeName} Wallet
							</h2>
							<div className="flex gap-2">
								{
									wallets.length > 1 && (
										<Button
											variant={"ghost"}
											onClick={() => setGridView(!gridView)}
											className="hidden md:block"
										>
											{gridView ? <Grid2X2/> : <List/>}
										</Button>
									)
								}
								<Button onClick={() => handleAddWallet()}>Add Wallet</Button>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button variant={"destructive"} className="self-end">
											Clear Wallets
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>
												Are you sure you want to delete all wallets?
											</AlertDialogTitle>
											<AlertDialogDescription>
												This action cannot be undone. This will permanently delete
												your wallets and keys from local storage.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Cancel</AlertDialogCancel>
											<AlertDialogAction onClick={() => handleClearWallets()}>
												Delete
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						</div>

						<div
							className={`grid gap-6 grid-cols-1 col-span-1  ${
								gridView ? "md:grid-cols-2 lg:grid-cols-3" : ""
							}`}
          	            >
							{
								wallets.map((wallet: IWallet, index: number) => (
									<motion.div
										key={index}
										initial={{ opacity: 0, y: -20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{
											duration: 0.3,
											ease: "easeInOut",
										}}
										className="flex flex-col rounded-2xl border border-primary/10"
									>
										<div className="flex justify-between px-8 py-6">
											<h3 className="font-bold text-2xl md:text-3xl tracking-tighter ">
												Wallet {index + 1}
											</h3>
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														variant="ghost"
														className="flex gap-2 items-center"
													>
														<Trash className="size-4 text-destructive" />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>
															Are you sure you want to delete this wallet?
														</AlertDialogTitle>
														 <AlertDialogDescription>
															This action cannot be undone. This will permanently
															delete your wallet and its key from local storage.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction
														onClick={() => handleDeleteWallet(index)}
														className="text-destructive"
													>
														Delete
													</AlertDialogAction>
												</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</div>
										<div className="flex flex-col gap-8 px-8 py-4 rounded-2xl bg-secondary/50">
											<div
												className="flex flex-col w-full gap-2"
												onClick={() => copyToClipboard(wallet.publicKey)}
											>
												<span className="text-lg md:text-xl font-bold tracking-tighter">
													Public Key
												</span>
												<p className="text-primary/80 font-medium cursor-pointer hover:text-primary transition-all duration-300 truncate">
													{wallet.publicKey}
												</p>
											</div>
											<div className="flex flex-col w-full gap-2">
												<span className="text-lg md:text-xl font-bold tracking-tighter">
													Private Key
												</span>
												<div className="flex justify-between w-full items-center gap-2">
													<p
														onClick={() => copyToClipboard(wallet.privateKey)}
														className="text-primary/80 font-medium cursor-pointer hover:text-primary transition-all duration-300 truncate"
													>
														{visiblePrivateKeys[index] ? wallet.privateKey: "*".repeat(115)}	{/** eye */}
													</p>
													<Button
														variant="ghost"
                        		onClick={() => togglePrivateKeyVisibility(index)}
													>
														{visiblePrivateKeys[index] ? (
															<EyeOff className="size-4" />
														): (
															<Eye className="size-4" />
														)}
													</Button>
												</div>
											</div>
										</div>
									</motion.div>
								))
							}
						</div>

					</motion.div>
				)
			}
		</div>
	);
}
