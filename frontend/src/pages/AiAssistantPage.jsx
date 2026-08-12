import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Bot, Lightbulb, History, Send } from "lucide-react";

import aiService from "../services/aiService";
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
  const { register, handleSubmit, reset, setValue } = useForm();

  const [response, setResponse] = useState("");
  const [displayed, setDisplayed] = useState("");
  const [loading, setLoading] = useState(false);

  const typingIntervalRef = useRef(null);

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
        error?.response?.data?.message || "AI request failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const onAsk = async (data) => {
    await askQuestion(data.question);
  };

  const handleQuickQuestion = (question) => {
    setValue("question", question);
  };

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
      console.error(error);
      toast.error("Failed to get deduction suggestions");
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    setLoading(true);
    setResponse("");
    setDisplayed("");

    try {
      const res = await aiService.summarize(1);

      const summary = res?.data?.data?.summary;

      if (!summary) {
        throw new Error("Empty response");
      }

      setResponse(summary);
      toast.success("Summary generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  const handleExplainTax = async () => {
    setLoading(true);
    setResponse("");
    setDisplayed("");

    try {
      const res = await aiService.explainTax(1);

      const explanation =
        res?.data?.data?.detailedExplanation;

      if (!explanation) {
        throw new Error("Empty response");
      }

      setResponse(explanation);
      toast.success("Explanation generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to explain tax record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 flex items-center justify-center">
              <Bot className="w-5 h-5 text-sky-600 dark:text-sky-400" />
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
                ].map((question) => (
                  <Button
                    key={question}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={() => handleQuickQuestion(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>

              {/* Response */}
              {(displayed || loading) && (
                <div className="rounded-xl border bg-gray-50 dark:bg-gray-900 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="w-4 h-4 text-sky-500" />

                    <span className="text-sm font-semibold">
                      AI Response
                    </span>
                  </div>

                  {loading && !displayed ? (
                    <div className="flex gap-1">
                      <span className="animate-bounce">•</span>
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
                        <span className="animate-pulse">▋</span>
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
                disabled={loading}
                onClick={handleSummarize}
                className="w-full justify-start gap-2"
              >
                <History className="w-4 h-4" />
                Summarize User #1
              </Button>

              <Button
                variant="ghost"
                disabled={loading}
                onClick={handleExplainTax}
                className="w-full justify-start gap-2"
              >
                <Bot className="w-4 h-4" />
                Explain Tax Record #1
              </Button>

            </CardContent>
          </Card>

        </div>
      </div>
    </PageTransition>
  );
}