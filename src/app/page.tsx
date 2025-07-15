import { GameUI } from '@/components/game-ui';
import { Swords, Trophy } from 'lucide-react';

export default function Home() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12">
      <header className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex items-center gap-3 sm:gap-4">
          <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-accent" />
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary md:text-5xl lg:text-6xl">
            Song Đấu Ngôn Ngữ
          </h1>
          <Swords className="h-8 w-8 sm:h-10 sm:w-10 text-accent" />
        </div>
        <p className="max-w-2xl text-lg text-foreground/80 md:text-xl">
          Thử thách kiến thức ngôn ngữ của bạn với AI! Nhập một từ khóa, giải câu đố và trở thành nhà vô địch.
        </p>
      </header>
      <GameUI />
    </main>
  );
}
