import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const Error500 = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4 text-center">
        <AlertTriangle className="h-24 w-24 text-destructive" />
        <h1 className="text-6xl font-bold">500</h1>
        <h2 className="text-2xl font-semibold">Server Error</h2>
        <p className="text-muted-foreground">
          Sorry, something went wrong on our end. Please try again later.
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

export default Error500;
