"use client";

import React, { useState, useReducer, useTransition, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import {
  BookOpen,
  ChevronRight,
  Languages,
  Lightbulb,
  Loader2,
  RefreshCw,
  Swords,
  Trophy,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { handleGeneratePuzzle, handleTranslateAndHint } from "@/app/actions";
import type { GeneratePuzzleOutput } from "@/ai/flows/generate-puzzle";
import type { TranslateAndHintOutput } from "@/ai/flows/translate-and-hint";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type GameState =
  | "IDLE"
  | "GENERATING_PUZZLE"
  | "PUZZLE_READY"
  | "GETTING_HINT"
  | "CHECKING_ANSWER"
  | "SHOW_RESULT"
  | "ERROR";

type State = {
  gameState: GameState;
  player1Score: number;
  player2Score: number; // For UI purposes
  keyword: string | null;
  puzzleData: GeneratePuzzleOutput | null;
  translationData: TranslateAndHintOutput | null;
  lastResult: "CORRECT" | "INCORRECT" | null;
  hintTaken: boolean;
  error: string | null;
  currentPlayer: 1 | 2;
};

type Action =
  | { type: "START_GAME"; payload: { keyword: string } }
  | { type: "PUZZLE_SUCCESS"; payload: GeneratePuzzleOutput }
  | { type: "GET_HINT" }
  | { type: "HINT_SUCCESS"; payload: TranslateAndHintOutput }
  | { type: "CHECK_ANSWER" }
  | { type: "SET_RESULT"; payload: { result: "CORRECT" | "INCORRECT"; translation: TranslateAndHintOutput } }
  | { type: "NEXT_ROUND" }
  | { type: "RESET_GAME" }
  | { type: "SET_ERROR"; payload: string };

const initialState: State = {
  gameState: "IDLE",
  player1Score: 0,
  player2Score: 0,
  keyword: null,
  puzzleData: null,
  translationData: null,
  lastResult: null,
  hintTaken: false,
  error: null,
  currentPlayer: 1,
};

function gameReducer(state: State, action: Action): State {
  switch (action.type) {
    case "START_GAME":
      return {
        ...state,
        gameState: "GENERATING_PUZZLE",
        keyword: action.payload.keyword,
        puzzleData: null,
        translationData: null,
        hintTaken: false,
        lastResult: null,
        error: null,
      };
    case "PUZZLE_SUCCESS":
      return { ...state, gameState: "PUZZLE_READY", puzzleData: action.payload };
    case "GET_HINT":
        return { ...state, gameState: "GETTING_HINT", hintTaken: true };
    case "HINT_SUCCESS":
        return { ...state, gameState: "PUZZLE_READY", translationData: action.payload };
    case "CHECK_ANSWER":
      return { ...state, gameState: "CHECKING_ANSWER" };
    case "SET_RESULT":
      const scoreIncrement = state.hintTaken ? 5 : 10;
      return {
        ...state,
        gameState: "SHOW_RESULT",
        lastResult: action.payload.result,
        translationData: action.payload.translation,
        player1Score: action.payload.result === "CORRECT" ? state.player1Score + scoreIncrement : state.player1Score,
      };
    case "NEXT_ROUND":
        return {
            ...state,
            gameState: "IDLE",
            keyword: null,
            puzzleData: null,
            translationData: null,
            hintTaken: false,
            lastResult: null,
            error: null,
            currentPlayer: state.currentPlayer === 1 ? 2 : 1,
        }
    case "RESET_GAME":
      return initialState;
    case "SET_ERROR":
      return { ...state, gameState: "ERROR", error: action.payload };
    default:
      return state;
  }
}

const keywordSchema = z.object({
  keyword: z.string().min(2, "Từ khóa phải có ít nhất 2 ký tự.").max(20, "Từ khóa không được quá 20 ký tự."),
});

const answerSchema = z.object({
  answer: z.string().min(1, "Vui lòng nhập câu trả lời."),
});

const PlayerScores: React.FC<{ p1Score: number; p2Score: number; currentPlayer: 1 | 2 }> = ({ p1Score, p2Score, currentPlayer }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <Card className={`transition-all duration-300 ${currentPlayer === 1 ? 'border-primary ring-2 ring-primary shadow-lg' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Người chơi 1</CardTitle>
        <User className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{p1Score} điểm</div>
      </CardContent>
    </Card>
    <Card className={`transition-all duration-300 ${currentPlayer === 2 ? 'border-primary ring-2 ring-primary shadow-lg' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Người chơi 2 (AI)</CardTitle>
        <User className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{p2Score} điểm</div>
      </CardContent>
    </Card>
  </div>
);

const Leaderboard: React.FC<{ playerScore: number }> = ({ playerScore }) => {
    const [leaderboardData, setLeaderboardData] = useState([
        { rank: 1, player: "Thần Dịch Thuật", score: 9850 },
        { rank: 2, player: "Vua Từ Vựng", score: 9500 },
        { rank: 3, player: "Bậc Thầy Ngôn Ngữ", score: 8900 },
        { rank: 4, player: "Chiến Binh Polyglot", score: 8200 },
        { rank: 5, player: "Bạn", score: 0 },
      ]);

    useEffect(() => {
        setLeaderboardData(prev => {
            const playerEntry = prev.find(p => p.player === "Bạn");
            if(playerEntry) playerEntry.score = playerScore;
            return [...prev].sort((a, b) => b.score - a.score).map((p, i) => ({...p, rank: i + 1}));
        });
    }, [playerScore]);

    return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-accent" /> Bảng Xếp Hạng
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Hạng</TableHead>
              <TableHead>Người chơi</TableHead>
              <TableHead className="text-right">Điểm</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboardData.map((p) => (
              <TableRow key={p.rank} className={p.player === "Bạn" ? "bg-secondary" : ""}>
                <TableCell className="font-medium">{p.rank}</TableCell>
                <TableCell>{p.player}</TableCell>
                <TableCell className="text-right">{p.score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
)};

export function GameUI() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const keywordForm = useForm<z.infer<typeof keywordSchema>>({
    resolver: zodResolver(keywordSchema),
    defaultValues: { keyword: "" },
  });

  const answerForm = useForm<z.infer<typeof answerSchema>>({
    resolver: zodResolver(answerSchema),
    defaultValues: { answer: "" },
  });

  const onKeywordSubmit = (values: z.infer<typeof keywordSchema>) => {
    startTransition(async () => {
      dispatch({ type: "START_GAME", payload: { keyword: values.keyword } });
      const result = await handleGeneratePuzzle({ keyword: values.keyword });
      if (result.success) {
        dispatch({ type: "PUZZLE_SUCCESS", payload: result.data });
      } else {
        dispatch({ type: "SET_ERROR", payload: result.error });
        toast({
          title: "Lỗi",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };

  const onGetHint = () => {
    if (!state.puzzleData) return;
    startTransition(async () => {
      dispatch({ type: "GET_HINT" });
      const result = await handleTranslateAndHint({ puzzle: state.puzzleData!.puzzle });
       if (result.success) {
        dispatch({ type: "HINT_SUCCESS", payload: result.data });
      } else {
        dispatch({ type: "SET_ERROR", payload: result.error });
        toast({
            title: "Lỗi",
            description: result.error,
            variant: "destructive",
        });
      }
    });
  };

  const onAnswerSubmit = (values: z.infer<typeof answerSchema>) => {
    if (!state.puzzleData) return;
    startTransition(async () => {
      dispatch({ type: "CHECK_ANSWER" });
      const translationResult = state.translationData ? { success: true, data: state.translationData } : await handleTranslateAndHint({ puzzle: state.puzzleData!.puzzle });
      
      if (translationResult.success) {
        const isCorrect = translationResult.data.translatedPuzzle.trim().toLowerCase() === values.answer.trim().toLowerCase();
        dispatch({
          type: "SET_RESULT",
          payload: {
            result: isCorrect ? "CORRECT" : "INCORRECT",
            translation: translationResult.data,
          },
        });
        answerForm.reset();
      } else {
        dispatch({ type: "SET_ERROR", payload: translationResult.error });
        toast({
            title: "Lỗi",
            description: translationResult.error,
            variant: "destructive",
        });
      }
    });
  };
  
  const renderGameState = () => {
    switch (state.gameState) {
      case "GENERATING_PUZZLE":
      case "CHECKING_ANSWER":
      case "GETTING_HINT":
        return (
          <div className="space-y-4 text-center">
            <div className="flex justify-center items-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <p className="text-muted-foreground">AI đang suy nghĩ...</p>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        );
        case "PUZZLE_READY":
            return (
              <form onSubmit={answerForm.handleSubmit(onAnswerSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Ngôn ngữ: <span className="font-bold text-primary">{state.puzzleData?.language}</span></p>
                  <p className="text-lg font-semibold">{state.puzzleData?.puzzle}</p>
                </div>
                {state.hintTaken && state.translationData && (
                    <Alert className="bg-secondary">
                        <Lightbulb className="h-4 w-4" />
                        <AlertTitle>Gợi ý</AlertTitle>
                        <AlertDescription>{state.translationData.hint}</AlertDescription>
                    </Alert>
                )}
                <div className="space-y-2">
                  <Controller
                    control={answerForm.control}
                    name="answer"
                    render={({ field }) => (
                      <Input {...field} placeholder="Nhập câu trả lời của bạn..." disabled={isPending} />
                    )}
                  />
                  {answerForm.formState.errors.answer && <p className="text-sm font-medium text-destructive">{answerForm.formState.errors.answer.message}</p>}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button type="submit" className="w-full" disabled={isPending}>
                        Kiểm tra <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button type="button" variant="outline" className="w-full" onClick={onGetHint} disabled={isPending || state.hintTaken}>
                        <Lightbulb className="mr-2 h-4 w-4" /> Gợi ý
                    </Button>
                </div>
              </form>
            );

      case "SHOW_RESULT":
        return (
            <div className="space-y-4 text-center">
                <h3 className={`text-2xl font-bold ${state.lastResult === 'CORRECT' ? 'text-green-600' : 'text-destructive'}`}>
                    {state.lastResult === 'CORRECT' ? 'Chính xác!' : 'Chưa đúng!'}
                </h3>
                <Card className="text-left bg-secondary">
                    <CardHeader>
                        <CardTitle className="text-base">Đáp án đúng</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold text-lg text-primary">{state.translationData?.translatedPuzzle}</p>
                        <p className="text-sm text-muted-foreground mt-2"><span className="font-semibold">Gợi ý:</span> {state.translationData?.hint}</p>
                    </CardContent>
                </Card>
                <Button onClick={() => dispatch({ type: "NEXT_ROUND" })}>
                    Vòng tiếp theo <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        );

      case "ERROR":
        return (
            <Alert variant="destructive">
                <Trophy className="h-4 w-4" />
                <AlertTitle>Đã có lỗi xảy ra</AlertTitle>
                <AlertDescription>
                    {state.error}
                    <Button variant="link" onClick={() => dispatch({ type: "RESET_GAME" })}>Thử lại</Button>
                </AlertDescription>
            </Alert>
        );

      case "IDLE":
      default:
        return (
          <form onSubmit={keywordForm.handleSubmit(onKeywordSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Controller
                control={keywordForm.control}
                name="keyword"
                render={({ field }) => (
                  <Input {...field} placeholder="Ví dụ: công nghệ, tình yêu,..." disabled={isPending} />
                )}
              />
              {keywordForm.formState.errors.keyword && <p className="text-sm font-medium text-destructive">{keywordForm.formState.errors.keyword.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Languages className="mr-2 h-4 w-4" />}
              Tạo câu đố
            </Button>
          </form>
        );
    }
  };

  const getCardDescription = () => {
    switch (state.gameState) {
      case "IDLE":
        return `Người chơi ${state.currentPlayer}, hãy nhập một từ khóa để bắt đầu.`;
      case "PUZZLE_READY":
        return "Dịch câu đố sang Tiếng Việt. Bạn có thể dùng gợi ý nếu cần.";
      case "SHOW_RESULT":
        return "Kết quả vòng đấu!";
      default:
        return "Hãy sẵn sàng cho thử thách ngôn ngữ!";
    }
  };


  return (
    <div className="w-full max-w-4xl space-y-8">
      <PlayerScores p1Score={state.player1Score} p2Score={state.player2Score} currentPlayer={state.currentPlayer} />

      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-6 w-6 text-primary" />
            Vòng Chơi
          </CardTitle>
          <CardDescription>{getCardDescription()}</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[220px] flex items-center justify-center">
            {renderGameState()}
        </CardContent>
        <CardFooter className="flex justify-end">
            <Button variant="ghost" onClick={() => dispatch({ type: "RESET_GAME" })} disabled={isPending}>
                <RefreshCw className="mr-2 h-4 w-4" /> Chơi lại từ đầu
            </Button>
        </CardFooter>
      </Card>

      <Leaderboard playerScore={state.player1Score} />
    </div>
  );
}
