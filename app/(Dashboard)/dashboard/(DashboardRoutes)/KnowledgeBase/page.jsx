"use client";

import React from "react";
import { Search, Plus, ChevronLeft, ChevronRight, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const knowledgeData = [
  {
    id: "test-3",
    title: "test-3",
    author: "kali raja",
    content: "test-3",
  },
  {
    id: "test-1",
    title: "Test",
    author: "kali raja",
    content: "Test",
  },
];

const KnowledgeBase = () => {
  return (
    <div className="flex flex-col h-full w-full bg-white p-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Knowledge Base</h1>
        <Button className="bg-blue-500 hover:bg-blue-600 transition-all duration-300 text-white rounded-md px-4 py-2 flex items-center gap-2 text-sm font-semibold">
          <Plus size={18} /> New Article
        </Button>
      </div>

      {/* Tabs Section - Original Design Mathiri */}
      <Tabs defaultValue="mine" className="w-full">
        <TabsList className="bg-transparent border-b border-slate-200 rounded-none w-1/4 justify-start h-auto p-0 gap-8">
          <TabsTrigger
            value="my-team"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0081a7] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 text-slate-600 font-medium text-base transition-all"
          >
            My Team
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default KnowledgeBase;
