import React, { createContext, useContext, useState } from 'react';
import { PrayerCandleModal } from '../components/modals/PrayerCandleModal';
import { DonationModal } from '../components/modals/DonationModal';

interface ModalContextType {
  openCandleModal: () => void;
  closeCandleModal: () => void;
  openDonationModal: () => void;
  closeDonationModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCandleModalOpen, setIsCandleModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  const openCandleModal = () => setIsCandleModalOpen(true);
  const closeCandleModal = () => setIsCandleModalOpen(false);
  const openDonationModal = () => setIsDonationModalOpen(true);
  const closeDonationModal = () => setIsDonationModalOpen(false);

  return (
    <ModalContext.Provider
      value={{
        openCandleModal,
        closeCandleModal,
        openDonationModal,
        closeDonationModal,
      }}
    >
      {children}
      <PrayerCandleModal
        isOpen={isCandleModalOpen}
        onClose={closeCandleModal}
      />
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={closeDonationModal}
      />
    </ModalContext.Provider>
  );
};

export const useModals = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModals must be used within a ModalProvider');
  }
  return context;
};
