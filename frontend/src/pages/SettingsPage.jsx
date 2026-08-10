import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import PageTransition from "../components/PageTransition";

export default function SettingsPage() {
  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-[#64748B]">Application preferences.</p>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Settings className="w-5 h-5" /> Appearance</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Theme toggled from sidebar.</p>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}