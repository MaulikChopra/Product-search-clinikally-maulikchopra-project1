import OmniSearch from '@/components/omni-search';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8 selection:bg-primary/30 selection:text-primary-foreground">
      <header className="mb-8 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-primary tracking-tight">
          <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            OmniSearch
          </span>
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find any product, effortlessly.
        </p>
      </header>
      
      <main className="w-full max-w-2xl">
        <OmniSearch />
      </main>

      <footer className="absolute bottom-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} OmniSearch. Built with Next.js and ❤️.</p>
      </footer>
    </div>
  );
}
