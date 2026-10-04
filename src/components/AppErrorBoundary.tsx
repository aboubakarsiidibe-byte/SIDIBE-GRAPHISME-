import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : undefined,
    };
  }

  componentDidCatch(error: unknown) {
    if (import.meta.env.DEV) {
      console.error('SIDIBE STUDIO application error:', error);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetView = () => {
    this.setState({ hasError: false, message: undefined });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 text-xl">
            !
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400">
            SIDIBE STUDIO
          </p>
          <h1 className="mt-2 text-xl font-black text-white">
            L’application a rencontré un problème
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Tes données locales sont conservées. Tu peux réessayer l’affichage ou recharger
            complètement l’application.
          </p>
          {this.state.message && (
            <details className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
              <summary className="cursor-pointer text-xs font-semibold text-zinc-300">
                Détails techniques
              </summary>
              <p className="mt-2 break-words text-[11px] text-zinc-500">{this.state.message}</p>
            </details>
          )}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={this.handleResetView}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-100 transition hover:bg-zinc-700"
            >
              Réessayer
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-black text-zinc-950 transition hover:bg-amber-400"
            >
              Recharger
            </button>
          </div>
        </section>
      </main>
    );
  }
}
