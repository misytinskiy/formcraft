// components/AccessDenied.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

function AccessDenied() {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-center">
          Доступ запрещён
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <Alert className="mb-4">
          <AlertDescription>
            Вы не можете получить доступ к панели управления, так как не
            являетесь членом организации.
          </AlertDescription>
        </Alert>
        <Button asChild className="w-full mb-2" variant={"destructive"}>
          <Link href={"/"}>Вернуться на главную</Link>
        </Button>

        <Button className="w-full" variant={"brand"}>
          Запросить доступ
        </Button>
        <div className="mt-4 text-center text-sm">
          Узнайте, как
          <Link className="underline ml-1" href="/instructions">
            начать работу
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default AccessDenied;
