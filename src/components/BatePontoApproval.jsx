import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock } from 'lucide-react'; // Added Clock icon
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

// Utility function to format date
const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const BatePontoApproval = () => {
  const { toast } = useToast();
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCheckins();
  }, []);

  const fetchCheckins = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('bate_ponto')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar pontos',
        variant: 'destructive'
      });
    } else {
      setCheckins(data || []);
    }

    setLoading(false);
  };

  const handleStatusUpdate = async (checkin, newStatus) => {
    let updatePayload = {
      approval_status: newStatus
    };

    // 🔥 REGRA: rejeitar ponto ativo ENCERRA
    if (newStatus === 'rejected' && checkin.status === 'in_progress') {
      const endedAt = new Date().toISOString();

      const startedAt = new Date(checkin.started_at);
      const endedDate = new Date(endedAt);
      const diffMs = endedDate - startedAt;

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);

      updatePayload = {
        ...updatePayload,
        status: 'completed',
        ended_at: endedAt,
        final_duration: `${hours}h ${minutes}m`
      };
    }

    // Aprovação só faz sentido se estiver encerrado
    if (newStatus === 'approved' && checkin.status !== 'completed') {
      toast({
        title: 'Ação bloqueada',
        description: 'Não é possível aprovar um ponto ainda em andamento.',
        variant: 'destructive'
      });
      return;
    }

    const { error } = await supabase
      .from('bate_ponto')
      .update(updatePayload)
      .eq('id', checkin.id);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar o ponto',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Sucesso',
        description:
          newStatus === 'approved'
            ? 'Ponto aprovado com sucesso.'
            : checkin.status === 'in_progress'
              ? 'Ponto rejeitado e encerrado automaticamente.'
              : 'Ponto rejeitado com sucesso.'
      });

      fetchCheckins();
    }
  };

  if (loading) {
    return <div className="text-white">Carregando Pontos...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">
        Aprovação de Ponto Eletrônico
      </h3>

      <div className="grid gap-4">
        {checkins.length === 0 && (
          <p className="text-[#a8a9ad]">
            Nenhum registro de ponto encontrado.
          </p>
        )}

        {checkins.map((checkin) => (
          <motion.div
            key={checkin.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black/40 border border-[#a8a9ad]/20 rounded-lg p-4 flex flex-col md:flex-row justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${checkin.approval_status === 'approved'
                      ? 'bg-green-900 text-green-200'
                      : checkin.approval_status === 'rejected'
                        ? 'bg-red-900 text-red-200'
                        : 'bg-yellow-900 text-yellow-200'
                    }`}
                >
                  {checkin.approval_status === 'pending'
                    ? 'Pendente'
                    : checkin.approval_status === 'approved'
                      ? 'Aprovado'
                      : 'Rejeitado'}
                </span>

                <span className="text-[#5FD068] font-bold">
                  {checkin.vehicle_prefix}
                </span>
              </div>

              <p className="text-white text-sm">
                <span className="text-[#a8a9ad]">Duração:</span>{' '}
                {checkin.final_duration || 'Em andamento'}
              </p>

              <div className="text-xs text-[#a8a9ad] mt-1">
                Guarnição:{' '}
                {Object.values(checkin.members || {})
                  .map((m) => m.name)
                  .join(', ')}
              </div>

              {/* New column for start date/time */}
              <div className="text-xs text-[#a8a9ad] mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Início: {formatDateTime(checkin.created_at)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {checkin.approval_status === 'pending' && (
                <>
                  {checkin.status === 'completed' && (
                    <Button
                      size="sm"
                      onClick={() =>
                        handleStatusUpdate(checkin, 'approved')
                      }
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprovar
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      handleStatusUpdate(checkin, 'rejected')
                    }
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeitar
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BatePontoApproval;