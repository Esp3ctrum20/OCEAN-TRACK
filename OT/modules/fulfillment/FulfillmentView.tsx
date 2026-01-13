
import React, { useState, useMemo } from 'react';
import { DercEntry, PresentationType } from '../../types';
import { getAvailableTallas, getFulfillmentResults } from './core/fulfillmentLogic';
import { FulfillmentHeader } from './layout/FulfillmentHeader';
import { FulfillmentResults } from './layout/FulfillmentResults';
import { FulfillmentStats } from './layout/FulfillmentStats';

interface Props {
  dercs: DercEntry[];
  onGoToDerc: (id: string) => void;
}

const FulfillmentView: React.FC<Props> = ({ dercs, onGoToDerc }) => {
  const [selectedType, setSelectedType] = useState<PresentationType>('Tallo Coral');
  const [selectedTalla, setSelectedTalla] = useState<string>('20-30');

  const availableTallas = useMemo(() => 
    getAvailableTallas(dercs, selectedType), 
  [dercs, selectedType]);

  const results = useMemo(() => 
    getFulfillmentResults(dercs, selectedType, selectedTalla), 
  [dercs, selectedType, selectedTalla]);

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <FulfillmentHeader 
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedTalla={selectedTalla}
        setSelectedTalla={setSelectedTalla}
        availableTallas={availableTallas}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <FulfillmentResults 
          results={results} 
          onGoToDerc={onGoToDerc} 
        />
        <FulfillmentStats 
          results={results} 
          selectedTalla={selectedTalla} 
        />
      </div>
    </div>
  );
};

export default FulfillmentView;
