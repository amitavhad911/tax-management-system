import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";

import {
  Bot,
  CalendarDays,
  CheckCircle2,
  FileText,
  History,
  Lightbulb,
  MessageSquare,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

import aiService from "../services/aiService";
import userService from "../services/userService";
import taxService from "../services/taxService";

import PageTransition from "../components/PageTransition";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const RECENT_QUESTIONS_KEY = "tax-manager-ai-recent-questions";
const MAX_RECENT_QUESTIONS = 5;

const SUGGESTED_QUESTIONS = [
  "What is the latest tax liability?",
  "Explain my latest tax computation",
  "What deductions are available?",
  "Compare my tax across financial years",
  "Why is my tax liability this amount?",
];

const extractList = (response) => {
  const data = response?.data?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.users)) {
    return data.users;
  }

  return [];
};

const extractHistory = (response) => {
  const data = response?.data?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  return [];
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") {
    return "₹0.00";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return "₹0.00";
  }

  return `₹${number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatPercentage = (value) => {
  if (value === null || value === undefined || value === "") {
    return "0%";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return "0%";
  }

  return `${number.toFixed(2)}%`;
};

const getInitial = (name = "") => {
  return name.trim().charAt(0).toUpperCase() || "?";
};

const getTypeLabel = (userType) => {
  return userType === "INSTITUTIONAL"
    ? "Institutional"
    : "Individual";
};

const getTypeClasses = (userType) => {
  if (userType === "INSTITUTIONAL") {
    return [
      "bg-violet-100 text-violet-700",
      "dark:bg-violet-950/50 dark:text-violet-300",
    ].join(" ");
  }

  return [
    "bg-sky-100 text-sky-700",
    "dark:bg-sky-950/50 dark:text-sky-300",
  ].join(" ");
};

export default function AiAssistantPage() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const [taxHistory, setTaxHistory] = useState([]);

  const [messages, setMessages] = useState([]);

  const [question, setQuestion] = useState("");

  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [aiStatus, setAiStatus] = useState("ready");

  const [recentQuestions, setRecentQuestions] = useState([]);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // =========================================================
  // LOAD RECENT QUESTIONS
  // =========================================================

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_QUESTIONS_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setRecentQuestions(parsed.slice(0, MAX_RECENT_QUESTIONS));
        }
      }
    } catch (error) {
      console.error("Failed to load recent AI questions:", error);
    }
  }, []);

  // =========================================================
  // LOAD USERS
  // =========================================================

  useEffect(() => {
    const loadUsers = async () => {
      setUsersLoading(true);

      try {
        const response = await userService.getAll({
          page: 0,
          size: 100,
        });

        const list = extractList(response);

        setUsers(list);

        setAiStatus("ready");
      } catch (error) {
        console.error("Failed to load taxpayers:", error);

        setAiStatus("offline");

        toast.error("Unable to load taxpayers");
      } finally {
        setUsersLoading(false);
      }
    };

    loadUsers();
  }, []);

  // =========================================================
  // LOAD SELECTED USER
  // =========================================================

  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUser(null);
      setTaxHistory([]);
      return;
    }

    const user = users.find(
      (item) => String(item.id) === String(selectedUserId)
    );

    setSelectedUser(user || null);

    if (!user) {
      setTaxHistory([]);
      return;
    }

    const loadTaxHistory = async () => {
      setHistoryLoading(true);

      try {
        const response = await taxService.getHistory(user.id);

        const history = extractHistory(response);

        setTaxHistory(history);
      } catch (error) {
        console.error("Failed to load taxpayer tax history:", error);

        setTaxHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadTaxHistory();
  }, [selectedUserId, users]);

  // =========================================================
  // AUTO SCROLL CHAT
  // =========================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // =========================================================
  // TAXPAYER CONTEXT FOR AI
  // =========================================================

  const taxpayerContext = useMemo(() => {
    if (!selectedUser) {
      return "";
    }

    const latest = taxHistory.length > 0
      ? taxHistory[0]
      : null;

    let context = `
Selected taxpayer information:
Taxpayer ID: ${selectedUser.id}
Name: ${selectedUser.fullName || "N/A"}
PAN: ${selectedUser.panNumber || "N/A"}
Taxpayer Type: ${getTypeLabel(selectedUser.userType)}
`;

    if (latest) {
      context += `
Latest tax computation:
Financial Year: ${latest.financialYear || "N/A"}
Gross Income: ${formatCurrency(latest.grossIncome)}
Deductions: ${formatCurrency(latest.deductions)}
Expenses: ${formatCurrency(latest.expenses)}
Taxable Income: ${formatCurrency(latest.taxableIncome)}
Income Tax: ${formatCurrency(latest.incomeTax)}
Cess: ${formatCurrency(latest.cess)}
Tax Rate: ${formatPercentage(latest.taxRate)}
Tax Liability: ${formatCurrency(latest.taxAmount)}
`;
    }

    if (taxHistory.length > 0) {
      context += `
Available financial-year tax records:
${taxHistory
  .map(
    (record) =>
      `FY ${record.financialYear}: Taxable Income ${formatCurrency(
        record.taxableIncome
      )}, Tax Liability ${formatCurrency(record.taxAmount)}`
  )
  .join("\n")}
`;
    }

    return context.trim();
  }, [selectedUser, taxHistory]);

  // =========================================================
  // RECENT QUESTIONS
  // =========================================================

  const saveRecentQuestion = (value) => {
    const trimmed = value.trim();

    if (!trimmed) {
      return;
    }

    setRecentQuestions((previous) => {
      const updated = [
        trimmed,
        ...previous.filter(
          (item) => item.toLowerCase() !== trimmed.toLowerCase()
        ),
      ].slice(0, MAX_RECENT_QUESTIONS);

      localStorage.setItem(
        RECENT_QUESTIONS_KEY,
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  const clearRecentQuestions = () => {
    localStorage.removeItem(RECENT_QUESTIONS_KEY);
    setRecentQuestions([]);
    toast.success("Recent questions cleared");
  };

  // =========================================================
  // ADD MESSAGE
  // =========================================================

  const addMessage = (role, content) => {
    setMessages((previous) => [
      ...previous,
      {
        id: `${Date.now()}-${Math.random()}`,
        role,
        content,
      },
    ]);
  };

  // =========================================================
  // ASK AI
  // =========================================================

  const askQuestion = async (value) => {
    const trimmed = value?.trim();

    if (!trimmed) {
      toast.error("Please enter a question");
      return;
    }

    if (!selectedUser) {
      toast.error("Please select a taxpayer first");
      return;
    }

    if (loading) {
      return;
    }

    setQuestion("");
    setLoading(true);
    setAiStatus("ready");

    addMessage("user", trimmed);
    saveRecentQuestion(trimmed);

    try {
      const response = await aiService.ask(
        trimmed,
        taxpayerContext
      );

      const answer = response?.data?.data?.answer;

      if (!answer) {
        throw new Error("Empty AI response");
      }

      addMessage("assistant", answer);

      toast.success("Answer received");
    } catch (error) {
      console.error("AI request failed:", error);

      setAiStatus("offline");

      addMessage(
        "assistant",
        "Unable to process your request."
      );

      toast.error(
        error?.response?.data?.message ||
          "AI request failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    await askQuestion(question);
  };

  const handleKeyDown = async (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      await askQuestion(question);
    }
  };

  // =========================================================
  // QUICK QUESTION
  // =========================================================

  const handleSuggestedQuestion = async (value) => {
    if (!selectedUser) {
      toast.error("Please select a taxpayer first");
      return;
    }

    await askQuestion(value);
  };

  // =========================================================
  // QUICK ACTION
  // =========================================================

  const runQuickAction = async (type) => {
    if (!selectedUser) {
      toast.error("Please select a taxpayer first");
      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);

    let actionQuestion = "";

    if (type === "deductions") {
      actionQuestion =
        "Suggest deductions that may be relevant to this taxpayer based on the available tax information.";
    }

    if (type === "compare") {
      actionQuestion =
        "Compare this taxpayer's tax computations across the available financial years and explain the major differences.";
    }

    if (type === "liability") {
      actionQuestion =
        "Explain how the latest tax liability of this taxpayer was determined.";
    }

    if (type === "summary") {
      try {
        addMessage(
          "user",
          "Summarize my tax information."
        );

        const response = await aiService.summarize(
          selectedUser.id
        );

        const summary = response?.data?.data?.summary;

        if (!summary) {
          throw new Error("Empty summary");
        }

        addMessage("assistant", summary);

        toast.success("Summary generated");
      } catch (error) {
        console.error("Summary failed:", error);

        addMessage(
          "assistant",
          "Unable to process your request."
        );

        toast.error("Failed to generate summary");
      } finally {
        setLoading(false);
      }

      return;
    }

    if (type === "latest") {
      const latest = taxHistory[0];

      if (!latest?.id) {
        setLoading(false);

        toast.error(
          "No completed tax computation found for this taxpayer"
        );

        return;
      }

      try {
        addMessage(
          "user",
          "Explain my latest tax computation."
        );

        const response = await aiService.explainTax(
          latest.id
        );

        const explanation =
          response?.data?.data?.detailedExplanation;

        if (!explanation) {
          throw new Error("Empty explanation");
        }

        addMessage("assistant", explanation);

        toast.success("Explanation generated");
      } catch (error) {
        console.error("Tax explanation failed:", error);

        addMessage(
          "assistant",
          "Unable to process your request."
        );

        toast.error("Failed to explain tax computation");
      } finally {
        setLoading(false);
      }

      return;
    }

    if (actionQuestion) {
      addMessage("user", actionQuestion);
      saveRecentQuestion(actionQuestion);

      try {
        const response = await aiService.ask(
          actionQuestion,
          taxpayerContext
        );

        const answer = response?.data?.data?.answer;

        if (!answer) {
          throw new Error("Empty AI response");
        }

        addMessage("assistant", answer);

        toast.success("Answer received");
      } catch (error) {
        console.error("Quick action failed:", error);

        addMessage(
          "assistant",
          "Unable to process your request."
        );

        toast.error("Unable to process the request");
      } finally {
        setLoading(false);
      }
    }
  };

  // =========================================================
  // CLEAR CHAT
  // =========================================================

  const clearChat = () => {
    setMessages([]);
    setQuestion("");
  };

  // =========================================================
  // RETRY
  // =========================================================

  const retryLastQuestion = async () => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === "user");

    if (!lastUserMessage) {
      return;
    }

    await askQuestion(lastUserMessage.content);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <PageTransition>
      <div className="space-y-6 pb-8">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

            <div className="flex items-start gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-950">
                <Bot className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold">
                    AI Tax Assistant
                  </h1>

                  <span
                    className={[
                      "inline-flex items-center gap-1.5 rounded-full",
                      "px-2.5 py-1 text-xs font-medium",
                      aiStatus === "ready"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
                    ].join(" ")}
                  >
                    {aiStatus === "ready" ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}

                    {aiStatus === "ready"
                      ? "AI Assistant Ready"
                      : "AI Assistant Offline"}
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Ask questions about taxpayers, tax computations,
                  deductions and financial years.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* TAXPAYER SELECTOR */}
        {/* ================================================= */}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-sky-500" />
              Select Taxpayer
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <select
              value={selectedUserId}
              onChange={(event) =>
                setSelectedUserId(event.target.value)
              }
              disabled={usersLoading}
              className="
                flex h-10 w-full rounded-md border
                border-slate-200 bg-white px-3 py-2
                text-sm text-slate-900
                outline-none transition
                focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20
                disabled:cursor-not-allowed disabled:opacity-60
                dark:border-slate-700 dark:bg-slate-900
                dark:text-white
              "
            >
              <option value="">
                {usersLoading
                  ? "Loading taxpayers..."
                  : "Select taxpayer"}
              </option>

              {users.map((user) => (
                <option
                  key={user.id}
                  value={user.id}
                >
                  {user.fullName} — #{user.id} —{" "}
                  {user.panNumber || "No PAN"} —{" "}
                  {getTypeLabel(user.userType)}
                </option>
              ))}
            </select>

            {!usersLoading && users.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No taxpayers are available.
              </p>
            )}

            {selectedUser && (
              <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60 sm:flex-row sm:items-center">

                <div
                  className="
                    flex h-12 w-12 shrink-0 items-center
                    justify-center rounded-full
                    bg-sky-500 text-lg font-bold text-white
                  "
                >
                  {getInitial(selectedUser.fullName)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">
                      {selectedUser.fullName}
                    </h3>

                    <span
                      className={[
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        getTypeClasses(selectedUser.userType),
                      ].join(" ")}
                    >
                      {getTypeLabel(selectedUser.userType)}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      Taxpayer ID: #{selectedUser.id}
                    </span>

                    <span>
                      PAN: {selectedUser.panNumber || "N/A"}
                    </span>
                  </div>
                </div>

                {historyLoading && (
                  <RefreshCw className="h-4 w-4 animate-spin text-sky-500" />
                )}

              </div>
            )}

          </CardContent>
        </Card>

        {/* ================================================= */}
        {/* MAIN CONTENT */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* ================================================= */}
          {/* CHAT */}
          {/* ================================================= */}

          <Card className="xl:col-span-2">

            <CardHeader className="border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between gap-3">

                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-4 w-4 text-sky-500" />
                  AI Tax Assistant
                </CardTitle>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearChat}
                  disabled={messages.length === 0 || loading}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear Chat
                </Button>

              </div>
            </CardHeader>

            <CardContent className="p-0">

              {/* CHAT AREA */}

              <div className="min-h-[420px] max-h-[520px] overflow-y-auto p-5">

                {messages.length === 0 ? (

                  <div className="flex min-h-[360px] flex-col items-center justify-center text-center">

                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-950">
                      <Bot className="h-7 w-7 text-sky-600 dark:text-sky-400" />
                    </div>

                    <h2 className="text-lg font-semibold">
                      How can I help with your taxes?
                    </h2>

                    <p className="mt-2 max-w-lg text-sm leading-6 text-gray-500 dark:text-gray-400">
                      {selectedUser
                        ? `Ask me about ${selectedUser.fullName}'s tax computation, deductions, liability or financial history.`
                        : "Select a taxpayer and ask me about their tax computation, deductions, liability or financial history."}
                    </p>

                    <div className="mt-6 flex max-w-2xl flex-wrap justify-center gap-2">
                      {SUGGESTED_QUESTIONS.map((item) => (
                        <Button
                          key={item}
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!selectedUser || loading}
                          onClick={() =>
                            handleSuggestedQuestion(item)
                          }
                        >
                          {item}
                        </Button>
                      ))}
                    </div>

                  </div>

                ) : (

                  <div className="space-y-5">

                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={[
                          "flex gap-3",
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start",
                        ].join(" ")}
                      >

                        {message.role === "assistant" && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-950">
                            <Bot className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                          </div>
                        )}

                        <div
                          className={[
                            "max-w-[85%] rounded-2xl px-4 py-3",
                            "text-sm leading-6 whitespace-pre-wrap",
                            message.role === "user"
                              ? "bg-sky-500 text-white"
                              : "border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
                          ].join(" ")}
                        >
                          {message.content}
                        </div>

                        {message.role === "user" && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white">
                            <UserRound className="h-4 w-4" />
                          </div>
                        )}

                      </div>
                    ))}

                    {loading && (
                      <div className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-950">
                          <Bot className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                            Analyzing your tax information...
                          </p>

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
                        </div>
                      </div>
                    )}

                    {messages.length > 0 &&
                      messages[messages.length - 1]?.content ===
                        "Unable to process your request." &&
                      !loading && (
                        <div className="flex justify-start">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={retryLastQuestion}
                            className="gap-2"
                          >
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                          </Button>
                        </div>
                      )}

                    <div ref={messagesEndRef} />

                  </div>
                )}

              </div>

              {/* MESSAGE INPUT */}

              <div className="border-t border-slate-200 p-4 dark:border-slate-700">

                <form
                  onSubmit={handleSubmit}
                  className="space-y-2"
                >
                  <div className="flex gap-2">

                    <textarea
                      ref={textareaRef}
                      value={question}
                      onChange={(event) =>
                        setQuestion(event.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      disabled={!selectedUser || loading}
                      rows={2}
                      placeholder={
                        selectedUser
                          ? "Ask a tax question..."
                          : "Select a taxpayer first..."
                      }
                      className="
                        min-h-[42px] flex-1 resize-none rounded-md
                        border border-slate-200 bg-white px-3 py-2
                        text-sm text-slate-900 outline-none
                        placeholder:text-slate-400
                        focus:border-sky-500
                        focus:ring-2 focus:ring-sky-500/20
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                        dark:border-slate-700
                        dark:bg-slate-900
                        dark:text-white
                      "
                    />

                    <Button
                      type="submit"
                      disabled={
                        !selectedUser ||
                        !question.trim() ||
                        loading
                      }
                      className="self-end gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {loading ? "Thinking..." : "Send"}
                    </Button>

                  </div>

                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Press Enter to send • Shift + Enter for a new line
                  </p>
                </form>

              </div>

            </CardContent>
          </Card>

          {/* ================================================= */}
          {/* RIGHT COLUMN */}
          {/* ================================================= */}

          <div className="space-y-6">

            {/* QUICK ACTIONS */}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Quick Actions
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2">

                {!selectedUser && (
                  <div className="mb-3 rounded-lg border border-dashed border-slate-300 p-3 text-sm text-gray-500 dark:border-slate-700 dark:text-gray-400">
                    Select a taxpayer to use these actions.
                  </div>
                )}

                <Button
                  variant="ghost"
                  disabled={!selectedUser || loading}
                  onClick={() =>
                    runQuickAction("deductions")
                  }
                  className="h-auto w-full justify-start gap-3 py-3 text-left"
                >
                  <Lightbulb className="h-4 w-4 shrink-0 text-amber-500" />

                  <span>
                    <span className="block font-medium">
                      Suggest Deductions
                    </span>

                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      Find potentially relevant deductions.
                    </span>
                  </span>
                </Button>

                <Button
                  variant="ghost"
                  disabled={!selectedUser || loading}
                  onClick={() =>
                    runQuickAction("summary")
                  }
                  className="h-auto w-full justify-start gap-3 py-3 text-left"
                >
                  <History className="h-4 w-4 shrink-0 text-sky-500" />

                  <span>
                    <span className="block font-medium">
                      Summarize Taxpayer
                    </span>

                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      Summarize the selected taxpayer.
                    </span>
                  </span>
                </Button>

                <Button
                  variant="ghost"
                  disabled={
                    !selectedUser ||
                    !taxHistory.length ||
                    loading
                  }
                  onClick={() =>
                    runQuickAction("latest")
                  }
                  className="h-auto w-full justify-start gap-3 py-3 text-left"
                >
                  <FileText className="h-4 w-4 shrink-0 text-violet-500" />

                  <span>
                    <span className="block font-medium">
                      Explain Latest Computation
                    </span>

                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      Explain the latest completed computation.
                    </span>
                  </span>
                </Button>

                <Button
                  variant="ghost"
                  disabled={!selectedUser || loading}
                  onClick={() =>
                    runQuickAction("compare")
                  }
                  className="h-auto w-full justify-start gap-3 py-3 text-left"
                >
                  <CalendarDays className="h-4 w-4 shrink-0 text-emerald-500" />

                  <span>
                    <span className="block font-medium">
                      Compare Financial Years
                    </span>

                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      Compare available tax computations.
                    </span>
                  </span>
                </Button>

                <Button
                  variant="ghost"
                  disabled={
                    !selectedUser ||
                    !taxHistory.length ||
                    loading
                  }
                  onClick={() =>
                    runQuickAction("liability")
                  }
                  className="h-auto w-full justify-start gap-3 py-3 text-left"
                >
                  <Sparkles className="h-4 w-4 shrink-0 text-sky-500" />

                  <span>
                    <span className="block font-medium">
                      Explain Tax Liability
                    </span>

                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      Understand the latest liability.
                    </span>
                  </span>
                </Button>

              </CardContent>
            </Card>

            {/* RECENT QUESTIONS */}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">
                    Recent Questions
                  </CardTitle>

                  {recentQuestions.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearRecentQuestions}
                      className="h-8 gap-1 text-xs"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Clear History
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent>

                {recentQuestions.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No recent questions.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {recentQuestions.map((item) => (
                      <button
                        key={item}
                        type="button"
                        disabled={!selectedUser || loading}
                        onClick={() =>
                          handleSuggestedQuestion(item)
                        }
                        className="
                          flex w-full items-start gap-2
                          rounded-lg px-2 py-2 text-left
                          text-sm transition
                          hover:bg-slate-100
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                          dark:hover:bg-slate-800
                        "
                      >
                        <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                        <span className="line-clamp-2">
                          {item}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

              </CardContent>
            </Card>

            {/* CAPABILITIES */}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-sky-500" />
                  AI Assistant can help with
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">

                  {[
                    "Tax computation explanations",
                    "Taxpayer history",
                    "Deduction information",
                    "Financial-year comparison",
                    "Tax liability explanations",
                    "Tax record summaries",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span>{item}</span>
                    </div>
                  ))}

                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </PageTransition>
  );
}