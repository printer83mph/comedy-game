import { SubmitHandler, useForm } from 'react-hook-form';

interface FormValues {
  displayName: string;
}

export default function DisplayNameInput({
  onSubmit,
}: {
  onSubmit: SubmitHandler<FormValues>;
}) {
  const { handleSubmit, register } = useForm<FormValues>({
    defaultValues: { displayName: '' },
  });

  return (
    <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="name-input" className="text-white/80 text-base">
        Enter Name
      </label>
      <input
        type="text"
        {...register('displayName', { required: false })}
        placeholder="Anonymous"
        className="px-6 py-3 rounded-2xl mt-1"
        id="name-input"
      />
      <button
        type="submit"
        className="ml-auto px-6 py-3 bg-yellow-100 rounded-2xl mt-8"
      >
        Submit
      </button>
    </form>
  );
}
