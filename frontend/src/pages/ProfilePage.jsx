import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";
import PageTransition from "../components/PageTransition";

export default function ProfilePage() {
  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm text-[#64748B]">Your account information.</p>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><UserCircle className="w-5 h-5" /> Admin Account</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-medium">Username:</span> admin</p>
            <p><span className="font-medium">Role:</span> Super Admin</p>
            <Button variant="outline" className="mt-4">Edit Profile</Button>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}