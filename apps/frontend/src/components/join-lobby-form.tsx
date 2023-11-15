import { SubmitHandler, useForm } from 'react-hook-form';

interface FormValues {
  lobbyId: string;
}

export default function JoinLobbyForm({
  onSubmit,
}: {
  onSubmit: SubmitHandler<FormValues>;
}) {
  const { handleSubmit, formState, register } = useForm<FormValues>({
    defaultValues: { lobbyId: '' },
  });

  const { isValid } = formState;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="relative">
        <input
          type="text"
          {...register('lobbyId', {
            required: true,
            pattern: /^[a-zA-Z0-9]{4}$/,
            setValueAs: (pin: string) => pin.toUpperCase(),
          })}
          placeholder="Enter Game Pin"
          className="px-6 tabular-nums py-3 w-52 bg-white/80 placeholder:text-neutral-600 rounded-2xl uppercase placeholder:normal-case transition-colors"
        />
        {isValid && (
          <button
            type="submit"
            className="absolute right-1 bg-yellow-100 rounded-2xl w-10 h-10 top-1/2 -translate-y-1/2"
          >
            →
          </button>
        )}
      </div>
    </form>
  );
}
