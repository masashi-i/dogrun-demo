import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Container className="text-center py-20">
        <div className="text-6xl mb-6">🐕</div>
        <h1 className="text-4xl font-bold text-text mb-4">404</h1>
        <p className="text-lg text-text-muted mb-8">
          お探しのページが見つかりませんでした
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors min-h-[48px]"
        >
          トップページに戻る
        </Link>
      </Container>
    </div>
  );
}
