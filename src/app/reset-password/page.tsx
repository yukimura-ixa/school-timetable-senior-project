import ResetPasswordPageClient from "./ResetPasswordPageClient";

type Props = {
  searchParams: Promise<{ token?: string; error?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
  const params = await searchParams;
  return <ResetPasswordPageClient token={params.token} error={params.error} />;
}
