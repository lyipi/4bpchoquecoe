import React from 'react'; 
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Edit, Check, X, Award, Trash2, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const getRankStyle = (rank) => {
  const r = rank?.toLowerCase() || '';
  if (r.includes('coronel') || r.includes('major')) return 'bg-white text-black font-extrabold';
  if (r.includes('capitão')) return 'bg-green-700 text-white font-bold';
  if (r.includes('tenente')) return 'bg-yellow-500 text-black font-bold';
  if (r.includes('aspirante')) return 'bg-blue-700 text-white font-bold';
  if (r.includes('sub tenente') || r.includes('subtenente') || r.includes('sargento'))
    return 'bg-red-700 text-white font-bold';
  if (r.includes('cabo') || r.includes('soldado'))
    return 'bg-slate-600 text-white font-medium';
  return 'bg-slate-800 text-slate-400';
};

const BooleanIcon = ({ value }) =>
  value ? (
    <Check className="w-5 h-5 text-green-500 mx-auto stroke-[3]" />
  ) : (
    <X className="w-5 h-5 text-slate-800 mx-auto" />
  );

const HierarchyTableRow = ({ officer, onEdit, onDelete, isAdmin, isEven, showActions = true }) => {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'group border-b border-slate-900/50 hover:bg-slate-900 text-sm h-24',
        isEven ? 'bg-[#050505]' : 'bg-transparent'
      )}
    >
      <td className="p-4 text-center font-mono text-slate-500 align-middle">
        {officer.cpf || '-'}
      </td>
      <td className="p-4 text-center font-mono text-slate-500 align-middle">
        {officer.serial || '-'}
      </td>
      <td className="p-4 text-center font-bold text-white align-middle whitespace-nowrap">
        {officer.full_name || officer.name}
      </td>
      <td className="p-4 text-center text-slate-500 align-middle">
        {officer.discord_id || '-'}
      </td>

      {/* Patente (Imagem) */}
      <td className="p-4 align-middle">
        <div className="flex justify-center items-center min-h-[56px]">
          {officer.insignia_image_url ? (
            <img
              src={officer.insignia_image_url}
              alt="Patente"
              className="w-14 h-14 object-contain"
            />
          ) : (
            <Shield className="w-14 h-14 text-slate-800" />
          )}
        </div>
      </td>

      {/* Graduação */}
      <td className="px-6 py-4 align-middle text-center">
        <span
          className={cn(
            'inline-flex items-center justify-center',
            'h-[38px] min-w-[170px] px-3',
            'text-xs uppercase tracking-widest whitespace-nowrap',
            'rounded shadow-lg',
            getRankStyle(officer.rank)
          )}
        >
          {officer.rank}
        </span>
      </td>

      <td className="p-4 text-center text-slate-300 align-middle">
        {officer.function || '-'}
      </td>

      <td className="p-4 text-center font-mono text-slate-500 align-middle">
        {officer.promotion_date || '-'}
      </td>
      <td className="p-4 text-center font-mono text-slate-500 align-middle">
        {officer.entry_date || '-'}
      </td>

      <td className="align-middle"><BooleanIcon value={officer.cdd} /></td>
      <td className="align-middle"><BooleanIcon value={officer.sat_b} /></td>
      <td className="align-middle"><BooleanIcon value={officer.tb} /></td>
      <td className="align-middle"><BooleanIcon value={officer.ta} /></td>
      <td className="align-middle"><BooleanIcon value={officer.mod_bopm} /></td>
      <td className="align-middle"><BooleanIcon value={officer.pop} /></td>
      <td className="align-middle"><BooleanIcon value={officer.abord} /></td>

      {/* Láurea */}
      <td className="p-4 align-middle">
        <div className="flex justify-center items-center min-h-[56px]">
          {officer.laurea_image_url ? (
            <img
              src={officer.laurea_image_url}
              alt="Láurea"
              className="w-14 h-14 object-contain"
            />
          ) : (
            <Award className="w-14 h-14 text-slate-800" />
          )}
        </div>
      </td>

      {/* Cursos (LADO A LADO, ALINHADO) */}
      <td className="p-4 align-middle">
        <div className="flex justify-center items-center gap-3 min-h-[56px]">
          {Array.isArray(officer.courses_images) && officer.courses_images.length > 0 ? (
            officer.courses_images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Curso ${idx + 1}`}
                className="w-14 h-14 object-contain drop-shadow-sm"
              />
            ))
          ) : (
            <span className="text-slate-800 text-xl font-black">.</span>
          )}
        </div>
      </td>

      {/* Ações */}
      {showActions && (
        <td className="p-4 align-middle text-right">
          {isAdmin && (
            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
              <Button size="icon" variant="ghost" onClick={() => onEdit(officer)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => onDelete(officer)}>
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          )}
        </td>
      )}
    </motion.tr>
  );
};

export default HierarchyTableRow;