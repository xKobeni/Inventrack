import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GalleryVerticalEnd, Mail, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import useEmailVerificationStore from '../../store/useEmailVerificationStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const EmailVerification = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    
    const {
        verifyEmail,
        requestVerification,
        isVerifying,
        verificationError,
        verificationSuccess,
        isRequestingVerification,
        requestError,
        requestSuccess,
        resetVerificationState
    } = useEmailVerificationStore();

    const [showRequestForm, setShowRequestForm] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (token) {
            handleVerification();
        }
        return () => {
            resetVerificationState();
        };
    }, [token]);

    const handleVerification = async () => {
        try {
            await verifyEmail(token);
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (error) {
            console.error('Verification failed:', error);
        }
    };

    const handleRequestVerification = async (e) => {
        e.preventDefault();
        try {
            await requestVerification(email);
            setShowRequestForm(false);
        } catch (error) {
            console.error('Request failed:', error);
        }
    };

    const renderContent = () => {
        if (isVerifying) {
            return (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                >
                    <div className="relative w-20 h-20 mx-auto mb-8">
                        <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
                        <Loader2 className="h-20 w-20 animate-spin text-primary absolute inset-0" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Mail className="h-10 w-10 text-primary/70" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Verifying your email...
                    </h2>
                    <p className="text-muted-foreground text-lg">Please wait while we confirm your email address</p>
                </motion.div>
            );
        }

        if (verificationSuccess) {
            return (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                >
                    <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-800/10 flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-green-600 to-green-500 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent">
                        Email Verified Successfully!
                    </h2>
                    <p className="text-muted-foreground text-lg mb-8">Your email has been verified. Redirecting to login...</p>
                    <Button 
                        onClick={() => navigate('/login')} 
                        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        Go to Login
                    </Button>
                </motion.div>
            );
        }

        if (verificationError) {
            return (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                >
                    <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/20 dark:to-red-800/10 flex items-center justify-center">
                        <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-red-600 to-red-500 dark:from-red-400 dark:to-red-300 bg-clip-text text-transparent">
                        Verification Failed
                    </h2>
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription className="text-base">
                            {verificationError}
                        </AlertDescription>
                    </Alert>
                    <p className="text-muted-foreground text-lg mb-8">
                        Your verification link may have expired or is invalid.
                    </p>
                    <div className="space-y-4">
                        <Button 
                            onClick={() => setShowRequestForm(true)}
                            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            Request New Verification Email
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => navigate('/login')}
                            className="w-full hover:bg-muted/50 transition-colors duration-200"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Login
                        </Button>
                    </div>
                </motion.div>
            );
        }

        if (showRequestForm) {
            return (
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                >
                    <div className="flex items-center mb-8">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowRequestForm(false)}
                            className="mr-3 hover:bg-muted/50 transition-colors duration-200"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            Request Verification Email
                        </h2>
                    </div>
                    <AnimatePresence>
                        {requestSuccess && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Alert className="mb-6">
                                    <AlertDescription className="text-base">
                                        Verification email sent! Please check your inbox.
                                    </AlertDescription>
                                </Alert>
                            </motion.div>
                        )}
                        {requestError && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Alert variant="destructive" className="mb-6">
                                    <AlertDescription className="text-base">
                                        {requestError}
                                    </AlertDescription>
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <form onSubmit={handleRequestVerification} className="space-y-6">
                        <div>
                            <label className="text-sm font-medium mb-2 block text-muted-foreground">
                                Enter your email address:
                            </label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter your email"
                                className="w-full h-12 text-base shadow-sm focus:shadow-md transition-shadow duration-200"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isRequestingVerification}
                            className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            {isRequestingVerification ? (
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            ) : null}
                            Send Verification Email
                        </Button>
                    </form>
                </motion.div>
            );
        }

        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center"
            >
                <div className="relative w-20 h-20 mx-auto mb-8">
                    <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
                    <Loader2 className="h-20 w-20 animate-spin text-primary absolute inset-0" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Mail className="h-10 w-10 text-primary/70" />
                    </div>
                </div>
                <h2 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Email Verification
                </h2>
                <p className="text-muted-foreground text-lg">Please wait while we verify your email...</p>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
            <div className="w-full max-w-md">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-center mb-8"
                >
                    <a href="#" className="flex items-center gap-2 font-medium">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
                            <GalleryVerticalEnd className="size-5" />
                        </div>
                        <span className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            InvenTrack
                        </span>
                    </a>
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-card rounded-xl shadow-xl p-8 backdrop-blur-sm border border-border/50"
                >
                    {renderContent()}
                </motion.div>
            </div>
        </div>
    );
};

export default EmailVerification; 