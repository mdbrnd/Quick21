import Modal from "react-modal";
import { RoundOverInfo } from "../../models/round_over_info";
import React from "react";

interface RoundOverModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  roundOverInfo: RoundOverInfo;
  onStartNewRound: () => void;
}

const RoundOverModal: React.FC<RoundOverModalProps> = ({
  isOpen,
  onRequestClose,
  roundOverInfo,
  onStartNewRound,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Round Over"
      className="modal"
      overlayClassName="overlay"
    >
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Round Over</h2>
        {Array.from(roundOverInfo.results.entries()).map(([player, result]) => (
          <div key={player.socketId} className="mb-2">
            <span className="font-semibold">{player.name}:</span> {result}
          </div>
        ))}
        <button
          onClick={() => {
            onStartNewRound();
            onRequestClose();
          }}
          className="mt-6 bg-primary text-secondary font-bold py-2 px-4 rounded hover:bg-primary-light transition-colors duration-300"
        >
          Start New Round
        </button>
      </div>
    </Modal>
  );
};

export default RoundOverModal;