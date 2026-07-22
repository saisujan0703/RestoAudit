"use client";

import Link from "next/link";
import { Utensils, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CustomerOrderPage() {
  return (
    <div className="max-w-2xl">
      <Card className="bg-[var(--bg-surface)] border-[var(--border-subtle)]">
        <CardContent className="p-8">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-[var(--orange-dim)] flex items-center justify-center shrink-0">
              <Utensils className="h-6 w-6 text-[var(--accent-orange)]" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-1)]">
                Orders are placed by staff
              </h1>
              <p className="text-[var(--text-2)]">
                To match the restaurant workflow, customers can’t place orders from the app.
                A waiter/staff member places the order and assigns it to your name.
              </p>
              <div className="pt-2">
                <Link href="/customer/history">
                  <Button variant="outline" className="border-[var(--border-subtle)]">
                    <Clock className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
