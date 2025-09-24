type ErrorStateProps = {
  message: string;
};

const ErrorState = ({ message }: ErrorStateProps) => {
  return (
    <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
      {message}
    </div>
  );
};

export default ErrorState;
