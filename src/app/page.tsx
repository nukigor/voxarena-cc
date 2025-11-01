export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full">
        <h1 className="text-6xl font-bold text-center mb-8">
          Welcome to <span className="text-primary">VoxArena</span>
        </h1>
        <p className="text-xl text-center text-muted-foreground mb-12">
          AI-Powered Debates with Distinct Personas
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg">
            <h3 className="text-2xl font-semibold mb-3">AI Personas</h3>
            <p className="text-muted-foreground">
              Create debaters and moderators with unique personalities, backgrounds, and communication styles.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-2xl font-semibold mb-3">Structured Debates</h3>
            <p className="text-muted-foreground">
              Generate debates in multiple formats with AI-powered moderation ensuring fairness.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-2xl font-semibold mb-3">Dual Output</h3>
            <p className="text-muted-foreground">
              Every debate as both a readable transcript and an immersive podcast experience.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
