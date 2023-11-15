import { NewGameState } from 'backend/src/types/server';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import Timer from './timer';

interface FormValues {
  caption: string;
}

export default function WritingStep({
  gameState,
  onSubmit: consumerOnSubmit,
}: {
  gameState: NewGameState;
  onSubmit: SubmitHandler<FormValues>;
}) {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { handleSubmit, register } = useForm<FormValues>();

  function onSubmit(data: FormValues) {
    setHasSubmitted(true);
    consumerOnSubmit(data);
  }

  return (
    <>
      <img
        src="/img/caption_this.svg"
        className="w-full lg:h-[100px] lg:w-auto"
      />
      {hasSubmitted ? (
        <div className="flex h-[540px] flex-col items-center justify-center text-white animate-pulse text-3xl">
          Waiting for other players...
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 flex flex-col items-center"
        >
          <div className="w-full lg:w-[650px]">
            <Timer
              endTime={gameState.endTime}
              className="text-center text-white animate-pulse"
            />
            <img
              src={gameState.imgUrl}
              className="aspect-square w-full object-cover rounded-xl mt-4"
            />
            <div className="flex mt-3">
              <input
                type="text"
                {...register('caption', { required: true })}
                className="px-3 py-2 flex-grow rounded-2xl"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-2xl ml-2 bg-yellow-200"
              >
                Go!
              </button>
            </div>
          </div>
        </form>
      )}
    </>
  );
}
