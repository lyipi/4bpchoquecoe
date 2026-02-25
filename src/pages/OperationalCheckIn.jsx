import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, Play, Square, Trash2, PlusCircle, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import MemberSearchModal from '@/components/MemberSearchModal';
import VehiclePrefixSelect from '@/components/VehiclePrefixSelect';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const REQUIRED_ROLES = [
  { key: 'boat_chief', label: 'Chefe de Barca', required: true },
  { key: 'driver', label: 'Motorista', required: true },
  { key: 'aux_1', label: '1º Auxiliar', required: true }
];

const OPTIONAL_ROLES = [
  { key: 'aux_2', label: '2º Auxiliar', required: false },
  { key: 'aux_3', label: '3º Auxiliar', required: false }
];

const OperationalCheckIn = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [activeShift, setActiveShift] = useState(null);
  const [shiftHistory, setShiftHistory] = useState([]);
  const [vehiclePrefix, setVehiclePrefix] = useState('');
  const [activeMembers, setActiveMembers] = useState({});
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSlotKey, setCurrentSlotKey] = useState(null);

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [newMemberData, setNewMemberData] = useState({ name: '', rank: 'Soldado', game_id: '' });

  const timerRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, [currentUser]);

  const fetchHistory = async () => {
    if (!currentUser) return;

    const { data: activeData } = await supabase
      .from('bate_ponto')
      .select('*')
      .eq('started_by', currentUser.username)
      .eq('status', 'active')
      .maybeSingle();

    if (activeData) {
      setActiveShift(activeData);
      setVehiclePrefix(activeData.vehicle_prefix);
      setActiveMembers(activeData.members || {});
    } else {
      setActiveShift(null);
      setVehiclePrefix('');
      setActiveMembers({});
    }

    const { data: historyData } = await supabase
      .from('bate_ponto')
      .select('*')
      .eq('started_by', currentUser.username)
      .order('created_at', { ascending: false })
      .limit(10);

    if (historyData) setShiftHistory(historyData);
  };

  useEffect(() => {
    if (!activeShift?.start_time) return;

    const tick = () => {
      const diff = new Date() - new Date(activeShift.start_time);
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setElapsedTime(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s
          .toString()
          .padStart(2, '0')}`
      );
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [activeShift]);

  const syncMembersIfActive = async (members) => {
    if (!activeShift) return;
    await supabase.from('bate_ponto').update({ members }).eq('id', activeShift.id);
  };

  const handleSelectMember = async (member) => {
    if (!currentSlotKey) return;

    const already = Object.values(activeMembers).some((m) => m.id === member.id);
    if (already) return;

    const updated = { ...activeMembers, [currentSlotKey]: member };
    setActiveMembers(updated);
    setIsModalOpen(false);
    await syncMembersIfActive(updated);
  };

  const handleRemoveMember = async (slotKey) => {
    const updated = { ...activeMembers };
    delete updated[slotKey];
    setActiveMembers(updated);
    await syncMembersIfActive(updated);
  };

  const handleStartShift = async () => {
    if (!vehiclePrefix) {
      toast({ title: 'Erro', description: 'Informe o prefixo da viatura.', variant: 'destructive' });
      return;
    }

    const missing = REQUIRED_ROLES.filter((r) => !activeMembers[r.key]);
    if (missing.length) {
      toast({ title: 'Equipe incompleta', description: 'Cargos obrigatórios não preenchidos.', variant: 'destructive' });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('bate_ponto').insert({
      vehicle_prefix: vehiclePrefix,
      members: activeMembers,
      start_time: new Date().toISOString(),
      status: 'active',
      started_by: currentUser.username,
      user_id: currentUser.id,
      approval_status: 'pending'
    });

    if (!error) fetchHistory();
    setLoading(false);
  };

  const handleEndShift = async () => {
    if (!activeShift) return;

    setLoading(true);
    const end = new Date();
    const duration = Math.floor((end - new Date(activeShift.start_time)) / 1000);

    await supabase
      .from('bate_ponto')
      .update({
        end_time: end.toISOString(),
        status: 'completed',
        duration_seconds: duration,
        final_duration: elapsedTime
      })
      .eq('id', activeShift.id);

    setActiveShift(null);
    setVehiclePrefix('');
    setActiveMembers({});
    setElapsedTime('00:00:00');
    fetchHistory();
    setLoading(false);
  };

  const getExistingMemberIds = () => Object.values(activeMembers).map((m) => m.id);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-[#5FD068]" />
          <h1 className="text-3xl font-bold text-white">Bate Ponto Operacional</h1>
        </div>
        {activeShift && (
          <div className="border border-[#5FD068] px-4 py-2 rounded-lg">
            <p className="text-2xl font-mono text-[#5FD068] font-bold">{elapsedTime}</p>
          </div>
        )}
      </div>

      {/* FORM */}
      <motion.div className="border rounded-xl p-6 bg-[#0a0a0a] border-white/10">
        <div className="flex gap-6 mb-8">
          <div className="flex-1">
            <label className="text-sm text-[#a8a9ad]">Prefixo da Viatura</label>
            <VehiclePrefixSelect
              value={vehiclePrefix}
              onChange={(e) => setVehiclePrefix(e.target.value)}
              disabled={!!activeShift}
            />
          </div>

          <div className="flex items-end">
            {!activeShift ? (
              <Button onClick={handleStartShift} disabled={loading} className="bg-[#5FD068] text-black">
                {loading ? <Loader2 className="animate-spin" /> : <Play />} Iniciar Turno
              </Button>
            ) : (
              <Button onClick={handleEndShift} className="bg-red-600 text-white">
                <Square /> Fechar Ponto
              </Button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...REQUIRED_ROLES, ...OPTIONAL_ROLES].map((role) => (
            <div key={role.key} className="border rounded-lg p-4 bg-black/30">
              <p className="text-xs text-[#5FD068] font-bold flex justify-between">
                {role.label}
                {role.required && <span className="text-red-400">Obrigatório</span>}
              </p>

              {activeMembers[role.key] ? (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white">{activeMembers[role.key].name}</p>
                    <p className="text-xs text-gray-400">{activeMembers[role.key].rank}</p>
                  </div>
                  <button onClick={() => handleRemoveMember(role.key)} className="text-red-500">
                    <Trash2 />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { setCurrentSlotKey(role.key); setIsModalOpen(true); }}>
                    <PlusCircle /> Selecionar
                  </Button>
                  <Button variant="ghost" onClick={() => { setCurrentSlotKey(role.key); setIsRegisterOpen(true); }}>
                    <UserPlus />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* HISTÓRICO */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Seu Histórico Recente</h2>
        <div className="space-y-3">
          {shiftHistory
            .filter((s) => s.status === 'completed')
            .map((shift) => (
              <div
                key={shift.id}
                className="bg-[#111] border border-white/10 rounded-lg p-4 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#5FD068] font-bold">Vtr: {shift.vehicle_prefix}</span>
                  <span className="text-white/60 text-sm">
                    {new Date(shift.start_time).toLocaleDateString()}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      shift.approval_status === 'approved'
                        ? 'bg-green-900 text-green-200'
                        : 'bg-yellow-900 text-yellow-200'
                    }`}
                  >
                    {shift.approval_status}
                  </span>
                </div>
                <p className="text-white font-bold">{shift.final_duration}</p>
              </div>
            ))}
        </div>
      </div>

      <MemberSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectMember={handleSelectMember}
        existingMemberIds={getExistingMemberIds()}
      />
    </div>
  );
};

export default OperationalCheckIn;