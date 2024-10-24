import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import Link from "next/link";

function AccessDenied() {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-center">
          Access denied
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <Alert className="mb-4">
          <AlertDescription>
            You cannot access the control panel.
          </AlertDescription>
        </Alert>
        <Button asChild className="w-full mb-2" variant={"destructive"}>
          <Link href={"/"}>Back to main page</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default AccessDenied;
