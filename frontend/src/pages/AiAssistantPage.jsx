import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import {
  Bot,
  Lightbulb,
  History,
  Send,
  UserRound,
  FileText,
} from "lucide-react";

import aiService from "../services/aiService";
import userService from "../services/userService";
import taxService from "../services/taxService";
import PageTransition from "../components/PageTransition";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AiAssistantPage() {
  const { register, handleSubmit, setValue } = useForm();

  const [response, setResponse] = useState("");
  const [displayed, setDisplayed] = useState("");

  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [records, setRecords] = useState([]);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedTaxRecordId, setSelectedTaxRecordId] = useState("");

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const typingIntervalRef = useRef(null);

  /*
   * Load users when page opens
   */
  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);

      try {
        const res = await userService.getAll({
          page: 0,
          size: 100,
        });

        const pageData = res?.data?.data;

        const userList = pageData?.content || [];

        setUsers(userList);
      } catch (error) {
        console.error("Failed to load users:", error);
        toast.error("Failed to load taxpayers");
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  /*
   * Load tax records whenever selected user changes
   */
  useEffect(() => {
    if (!selectedUserId) {
      setRecords([]);
      setSelectedTaxRecordId("");
      return;
    }

    const loadTaxHistory = async () => {
      setLoadingRecords(true);
      setRecords([]);
      setSelectedTaxRecordId("");

      try {
        const res = await taxService.getHistory(selectedUserId);

        const history = res?.data?.data || [];

        setRecords(history);

        if (history.length > 0) {
          setSelectedTaxRecordId(String(history[0].id));
        }
      } catch (error) {
        console.error("Failed to load tax history:", error);
        toast.error("Failed to load tax records");
      } finally {
        setLoadingRecords(false);
      }
    };

    loadTaxHistory();
  }, [selectedUserId]);

  /*
   * Typing effect
   */
  useEffect(() => {
    if (!response) {
      setDisplayed("");
      return;
    }

    let index = 0;

    clearInterval(typingIntervalRef.current);

    typingIntervalRef.current = setInterval(() => {
      index += 1;

      setDisplayed(response.slice(0, index));

      if (index >= response.length) {
        clearInterval(typingIntervalRef.current);
      }
    }, 15);

    return () => {
      clearInterval(typingIntervalRef.current);
    };
  }, [response]);

  /*
   * Ask AI question
   */
  const askQuestion = async (question) => {
    if (!question?.trim()) {
      toast.error("Please enter a question");
      return;
    }

    setResponse("");
    setDisplayed("");
    setLoading(true);

    try {
      const res = await aiService.ask(question);

      const answer = res?.data?.data?.answer;

      if (!answer) {
        throw new Error("Empty AI response");
      }

      setResponse(answer);
      toast.success("Answer received");
    } catch (error) {
      console.error("AI request failed:", error);

      toast.error(
        error?.response?.data?.message ||
          "AI request failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const onAsk = async (data) => {
    await askQuestion(data.question);
  };

  /*
   * Quick question
   */
  const handleQuickQuestion = (question) => {
    setValue("question", question);
  };

  /*
   * Suggest deductions
   */
  const handleSuggestDeductions = async () => {
    setLoading(true);
    setResponse("");
    setDisplayed("");

    try {
      const res = await aiService.suggestDeductions();

      const suggestion = res?.data?.data?.suggestion;

      if (!suggestion) {
        throw new Error("Empty response");
      }

      setResponse(suggestion);
      toast.success("Suggestions received");
    } catch (error) {
      console.error("Failed to get deduction suggestions:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to get deduction suggestions"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Summarize selected user's history
   */
  const handleSummarize = async () => {
    if (!selectedUserId) {
      toast.error("Please select a taxpayer first");
      return;
    }

    setLoading(true);
    setResponse("");
    setDisplayed("");

    try {
      const res = await aiService.summarize(
        selectedUserId
      );

      const summary = res?.data?.data?.summary;

      if (!summary) {
        throw new Error("Empty response");
      }

      setResponse(summary);
      toast.success("Summary generated");
    } catch (error) {
      console.error("Failed to generate summary:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to generate summary"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Explain selected tax record
   */
  const handleExplainTax = async () => {
    if (!selectedTaxRecordId) {
      toast.error("Please select a tax record first");
      return;
    }

    setLoading(true);
    setResponse("");
    setDisplayed("");

    try {
      const res = await aiService.explainTax(
        selectedTaxRecordId
      );

      const explanation =
        res?.data?.data?.detailedExplanation;

      if (!explanation) {
        throw new Error("Empty response");
      }

      setResponse(explanation);
      toast.success("Tax explanation generated");
    } catch (error) {
      console.error(
        "Failed to explain tax record:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to explain tax record"
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = users.find(
    (user) => String(user.id) === String(selectedUserId)
  );

  return (
    <PageTransition>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
              <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                AI Tax Assistant
              </h1>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ask tax-related questions and get intelligent suggestions.
              </p>
            </div>
          </div>
        </div>

        {/* Taxpayer Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserRound className="w-5 h-5" />
              Select Taxpayer
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* User */}
              <div>
                <label
                  htmlFor="taxpayer"
                  className="block text-sm font-medium mb-2"
                >
                  Taxpayer
                </label>

                <select
                  id="taxpayer"
                  value={selectedUserId}
                  onChange={(e) =>
                    setSelectedUserId(e.target.value)
                  }
                  disabled={loading || loadingUsers}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">
                    {loadingUsers
                      ? "Loading taxpayers..."
                      : "Select taxpayer"}
                  </option>

                  {users.map((user) => (
                    <option
                      key={user.id}
                      value={user.id}
                    >
                      {user.fullName} — {user.panNumber || "No PAN"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tax Record */}
              <div>
                <label
                  htmlFor="tax-record"
                  className="block text-sm font-medium mb-2"
                >
                  Tax Record
                </label>

                <select
                  id="tax-record"
                  value={selectedTaxRecordId}
                  onChange={(e) =>
                    setSelectedTaxRecordId(e.target.value)
                  }
                  disabled={
                    loading ||
                    loadingRecords ||
                    !selectedUserId
                  }
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">
                    {!selectedUserId
                      ? "Select taxpayer first"
                      : loadingRecords
                      ? "Loading tax records..."
                      : records.length === 0
                      ? "No tax records found"
                      : "Select tax record"}
                  </option>

                  {records.map((record) => (
                    <option
                      key={record.id}
                      value={record.id}
                    >
                      {record.financialYear} — Tax: ₹
                      {Number(
                        record.taxAmount || 0
                      ).toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected taxpayer information */}
            {selectedUser && (
              <div className="mt-4 rounded-lg border bg-muted/30 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">
                      Name
                    </p>
                    <p className="font-medium">
                      {selectedUser.fullName}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">
                      PAN
                    </p>
                    <p className="font-medium">
                      {selectedUser.panNumber || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">
                      User Type
                    </p>
                    <p className="font-medium">
                      {selectedUser.userType || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main AI area */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">
                Ask a Question
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">

              <form
                onSubmit={handleSubmit(onAsk)}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Input
                  {...register("question", {
                    required: "Question is required",
                  })}
                  placeholder="Ask anything about tax..."
                  disabled={loading}
                  className="flex-1"
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />

                  {loading ? "Thinking..." : "Ask"}
                </Button>
              </form>

              {/* Quick questions */}
              <div className="flex flex-wrap gap-2">
                {[
                  "What are the current tax slabs?",
                  "What deductions are available?",
                  "What is PAN information?",
                  "What is Health and Education Cess?",
                  "What is Section 87A rebate?",
                ].map((question) => (
                  <Button
                    key={question}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={() =>
                      handleQuickQuestion(question)
                    }
                  >
                    {question}
                  </Button>
                ))}
              </div>

              {/* Response */}
              {(displayed || loading) && (
                <div className="rounded-xl border bg-gray-50 dark:bg-gray-900 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="w-4 h-4 text-indigo-500" />

                    <span className="text-sm font-semibold">
                      AI Response
                    </span>
                  </div>

                  {loading && !displayed ? (
                    <div className="flex gap-1">
                      <span className="animate-bounce">
                        •
                      </span>

                      <span className="animate-bounce [animation-delay:100ms]">
                        •
                      </span>

                      <span className="animate-bounce [animation-delay:200ms]">
                        •
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm leading-6 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                      {displayed}

                      {loading && (
                        <span className="animate-pulse">
                          ▌
                        </span>
                      )}
                    </p>
                  )}
                </div>
              )}

            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Quick Actions
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">

              <Button
                variant="ghost"
                disabled={loading}
                onClick={handleSuggestDeductions}
                className="w-full justify-start gap-2"
              >
                <Lightbulb className="w-4 h-4" />
                Suggest Deductions
              </Button>

              <Button
                variant="ghost"
                disabled={
                  loading || !selectedUserId
                }
                onClick={handleSummarize}
                className="w-full justify-start gap-2"
              >
                <History className="w-4 h-4" />

                {selectedUser
                  ? `Summarize ${selectedUser.fullName}`
                  : "Summarize User"}
              </Button>

              <Button
                variant="ghost"
                disabled={
                  loading || !selectedTaxRecordId
                }
                onClick={handleExplainTax}
                className="w-full justify-start gap-2"
              >
                <FileText className="w-4 h-4" />

                {selectedTaxRecordId
                  ? "Explain Selected Tax"
                  : "Explain Tax Record"}
              </Button>

            </CardContent>
          </Card>

        </div>
      </div>
    </PageTransition>
  );
}