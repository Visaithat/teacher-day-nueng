export default function Home() {
  return (
    <main className="flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <h1 className="font-title text-foreground text-[clamp(2rem,9vw,6.5rem)] leading-[1.75]">
        <span className="block">
          <span className="bg-highlight box-decoration-clone rounded-md px-4 py-2 sm:px-6 sm:py-3">
            Greeting,
          </span>
        </span>
        <span className="mt-2 block sm:ml-[0.5em]">
          <span className="bg-highlight box-decoration-clone rounded-md px-4 py-2 sm:px-6 sm:py-3">
            Teacher Nueng
          </span>
        </span>
      </h1>

      <p className="text-foreground text-sm font-bold tracking-tight sm:text-base">
        It&rsquo;s been such a long time no talk
      </p>
    </main>
  );
}
