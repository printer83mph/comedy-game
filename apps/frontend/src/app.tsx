import { useState } from 'react';

import { LobbyID } from '../../backend/src/types/server';

import Game from './components/game';
import useLobbySocket from './hooks/use-lobby-socket';

function App() {
  const { connected, lobby, createLobby, joinLobby } = useLobbySocket();
  const [joinLobbyId, setJoinLobbyId] = useState('');

  return connected ? (
    <>
      {lobby.lobbyId ? (
        <Game {...lobby} />
      ) : (
        <main className="container mx-auto pt-12">
          <div>
            <button
              type="button"
              onClick={() => {
                createLobby('Thomas');
              }}
            >
              Create Lobby
            </button>
          </div>
          <div>
            <input
              type="text"
              value={joinLobbyId}
              onChange={(evt) => setJoinLobbyId(evt.target.value)}
            />
            <button
              type="button"
              onClick={() => {
                joinLobby(joinLobbyId as LobbyID);
              }}
            >
              Join Lobby
            </button>
          </div>
        </main>
      )}
    </>
  ) : (
    <div>Loading...</div>
  );
}

export default App;
