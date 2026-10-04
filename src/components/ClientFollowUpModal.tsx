import React, { useState } from 'react';
import { Project, Task } from '../types';
import { Mail, MessageSquare, Copy, Check, X, Send } from 'lucide-react';

interface ClientFollowUpModalProps {
  task: Task;
  project?: Project;
  onClose: () => void;
}

export const ClientFollowUpModal: React.FC<ClientFollowUpModalProps> = ({
  task,
  project,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [channel, setChannel] = useState<'email' | 'whatsapp'>('email');

  const clientName = project?.client || 'Cher client';
  const projectName = project?.name || 'votre projet de création graphique';

  const emailSubject = `SIDIBE STUDIO — Suivi & Validation : ${task.title} [${projectName}]`;

  const emailBody = `Bonjour ${clientName},

J'espère que vous passez une excellente journée.

Je reviens vers vous concernant notre collaboration sur "${projectName}". 
Nous avons avancé sur l'étape suivante : "${task.title}".

Afin de pouvoir finaliser les livrables dans le respect du calendrier prévu, pourriez-vous s'il vous plaît nous faire part de vos retours ou nous confirmer votre validation ?

${project?.links && project.links.length > 0 ? `Pour rappel, les fichiers sont consultables ici :\n${project.links.map(l => `• ${l.title} : ${l.url}`).join('\n')}\n` : ''}
Je reste à votre entière disposition pour tout échange ou ajustement.

Bien cordialement,
L'équipe SIDIBE STUDIO
Direction Artistique & Design`;

  const whatsappBody = `Bonjour ${clientName} ! Petit message de suivi SIDIBE STUDIO concernant "${projectName}". Pourriez-vous nous valider l'étape "${task.title}" afin de respecter le planning de livraison ? Merci beaucoup et excellente journée !`;

  const textToCopy = channel === 'email' ? `Objet : ${emailSubject}\n\n${emailBody}` : whatsappBody;

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Mail className="w-4 h-4" />
            <span>Relance Client Automatisée — SIDIBE STUDIO</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="text-xs text-zinc-400">
            Générez en un clic un message professionnel prêt à l'envoi pour relancer la validation client ou débloquer le statut.
          </div>

          {/* Channel selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setChannel('email')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                channel === 'email'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Format Email Formel</span>
            </button>
            <button
              onClick={() => setChannel('whatsapp')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                channel === 'whatsapp'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Format Message Court (WhatsApp / Slack)</span>
            </button>
          </div>

          {/* Preview Box */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
            {textToCopy}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <span className="text-xs text-zinc-500">
            {project?.clientEmail ? `Destinataire : ${project.clientEmail}` : 'Copiez et collez dans votre boîte mail'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white"
            >
              Fermer
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-zinc-950" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copié dans le presse-papier !' : 'Copier le message'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
