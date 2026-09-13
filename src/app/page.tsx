export default function Home() {
  return (
    <main className="flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <h1 className="font-title text-foreground text-[clamp(2rem,9vw,6.5rem)] leading-[1.75]">
        <span className="block">Greeting,</span>
        <span className="mt-2 block sm:ml-[0.5em]">Teacher Nueng</span>
      </h1>

      <p className="text-foreground text-sm font-bold tracking-tight sm:text-base">
        It&rsquo;s been such a long time no talk
      </p>
    </main>
  );
}
