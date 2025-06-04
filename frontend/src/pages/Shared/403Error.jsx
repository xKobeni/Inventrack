import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

const Error403 = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4 text-center">
        <Lock className="h-24 w-24 text-destructive" />
        <h1 className="text-6xl font-bold">403</h1>
        <h2 className="text-2xl font-semibold">Access Forbidden</h2>
        <p className="text-muted-foreground">
          Sorry, you don't have permission to access this page.
        </p>
        <Button
          onClick={() => navigate('/')}
          className="mt-4"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default Error403;
