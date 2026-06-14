import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

type Player = 'X' | 'O' | null;

export default function TicTacToe() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true);

  const calculateWinner = (squares: Player[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (index: number) => {
    if (board[index] || calculateWinner(board)) return;

    const newBoard = [...board];
    newBoard[index] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(square => square !== null);
  
  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (isDraw) {
    status = "Draw!";
  } else {
    status = `Next player: ${xIsNext ? 'X' : 'O'}`;
  }

  return (
    <div className="fixed inset-0 bg-[#0b0a10] text-white flex flex-col items-center justify-center z-[9999] selection:bg-transparent">
      <div className="bg-[#111018] border border-gray-800 p-8 flex flex-col items-center rounded-2xl w-full max-w-[400px] shadow-2xl">
        <h1 className="text-2xl font-bold mb-2 text-white tracking-tight">Panic Lock Active</h1>
        
        <div className="text-sm text-gray-400 mb-8 uppercase tracking-widest font-medium">
          {status}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-8 bg-[#1a1924] p-3 rounded-xl border border-gray-800 shadow-inner">
          {board.map((square, i) => (
            <button
              key={i}
              onClick={() => handleClick(i)}
              className="w-20 h-20 bg-[#252436] hover:bg-[#2d2b3b] transition-colors rounded-lg flex items-center justify-center text-4xl font-bold border border-gray-700/50"
              style={{
                color: square === 'X' ? '#a855f7' : '#60a5fa',
                textShadow: square === 'X' ? '0 0 15px rgba(168,85,247,0.5)' : '0 0 15px rgba(96,165,250,0.5)'
              }}
            >
              {square}
            </button>
          ))}
        </div>

        <button 
          onClick={resetGame}
          className="w-full py-3 flex items-center justify-center gap-2 rounded-xl bg-[#2a1d45] hover:bg-[#3a2860] border border-[#a855f7]/30 text-[#a855f7] hover:text-[#d8b4fe] transition-all font-bold"
        >
          <RefreshCw size={18} />
          Reset Board
        </button>
        
        <p className="text-xs text-gray-600 mt-6 font-mono">Press ESC 3 times to trigger</p>
      </div>
    </div>
  );
}
