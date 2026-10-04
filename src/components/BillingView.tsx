import React, { useState } from 'react';
import {
  FileText,
  Receipt,
  Plus,
  Printer,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  DollarSign,
  Building,
  User,
  Calendar,
  Eye,
  ArrowUpRight,
  TrendingUp,
  Download,
  Image as ImageIcon,
} from 'lucide-react';
import {
  ProformaInvoice,
  PaymentReceipt,
  Workspace,
  Project,
} from '../types';
import {
  downloadProformaFile,
  downloadReceiptFile,
  printDocumentWindow,
  generateProformaHTML,
  generateReceiptHTML,
} from '../utils/documentExport';

interface BillingViewProps {
  workspace: Workspace;
  projects: Project[];
  proformas: ProformaInvoice[];
  receipts: PaymentReceipt[];
  onNewProforma: () => void;
  onEditProforma: (proforma: ProformaInvoice) => void;
  onDeleteProforma: (id: string) => void;
  onNewReceipt: () => void;
  onEditReceipt: (receipt: PaymentReceipt) => void;
  onDeleteReceipt: (id: string) => void;
  onCreateReceiptFromProforma: (proforma: ProformaInvoice) => void;
  onOpenLogoModal?: () => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  workspace,
  projects,
  proformas,
  receipts,
  onNewProforma,
  onEditProforma,
  onDeleteProforma,
  onNewReceipt,
  onEditReceipt,
  onDeleteReceipt,
  onCreateReceiptFromProforma,
  onOpenLogoModal,
}) => {
  const [activeTab, setActiveTab] = useState<'proformas' | 'receipts'>('proformas');
  const [searchQuery, setSearchQuery] = useState('');

  // Financial aggregates
  const totalProformaAmount = proformas.reduce((acc, p) => acc + p.totalAmount, 0);
  const totalAcceptedProformas = proformas
    .filter((p) => p.status === 'Acceptée & Signée' || p.status === 'Convertie en projet')
    .reduce((acc, p) => acc + p.totalAmount, 0);
  const totalReceiptsAmount = receipts.reduce((acc, r) => acc + r.amountPaid, 0);
  const totalRemainingDue = receipts.reduce((acc, r) => acc + r.remainingBalance, 0);

  // Filters
  const filteredProformas = proformas.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.number.toLowerCase().includes(q) ||
      p.clientName.toLowerCase().includes(q) ||
      (p.clientCompany && p.clientCompany.toLowerCase().includes(q)) ||
      p.title.toLowerCase().includes(q)
    );
  });

  const filteredReceipts = receipts.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.receiptNumber.toLowerCase().includes(q) ||
      r.clientName.toLowerCase().includes(q) ||
      (r.clientCompany && r.clientCompany.toLowerCase().includes(q)) ||
      (r.projectName && r.projectName.toLowerCase().includes(q)) ||
      r.paymentMethod.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header with Title and Action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>Facturation Proforma & Reçus de Paiement</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Émettez des devis proforma aux normes UEMOA / Côte d'Ivoire et téléchargez des attestations de paiement avec votre logo.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenLogoModal && (
            <button
              onClick={onOpenLogoModal}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Insérer ou changer le logo officiel du studio"
            >
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>{workspace.logoUrl ? 'Logo Studio ✓' : 'Insérer un Logo'}</span>
            </button>
          )}

          <button
            onClick={onNewProforma}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Proforma</span>
          </button>
          <button
            onClick={onNewReceipt}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>Nouveau Reçu Client</span>
          </button>
        </div>
      </div>

      {/* Studio Branding & Logo Banner */}
      <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {workspace.logoUrl || workspace.billingInfo.logoUrl ? (
            <div className="p-1.5 bg-zinc-950 border border-zinc-800 rounded-xl">
              <img
                src={workspace.logoUrl || workspace.billingInfo.logoUrl}
                alt="Logo Studio"
                className="h-10 max-w-[150px] object-contain"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center font-mono font-black text-amber-400 text-base shrink-0">
              {workspace.name.substring(0, 2).toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-white">
                {workspace.billingInfo.companyName || workspace.name}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Logo Actif sur Devis & Reçus
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {workspace.billingInfo.address}, {workspace.billingInfo.city} • Tél: {workspace.billingInfo.phone}
            </p>
          </div>
        </div>

        {onOpenLogoModal && (
          <button
            onClick={onOpenLogoModal}
            className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-amber-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>Modifier le Logo du Studio</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Total Devis Proforma
            </div>
            <div className="text-lg font-black font-mono text-zinc-100 mt-1">
              {totalProformaAmount.toLocaleString('fr-FR')}{' '}
              <span className="text-xs text-zinc-400 font-sans">XOF</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">{proformas.length} devis émis</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Devis Validés / Signés
            </div>
            <div className="text-lg font-black font-mono text-emerald-400 mt-1">
              {totalAcceptedProformas.toLocaleString('fr-FR')}{' '}
              <span className="text-xs text-zinc-400 font-sans">XOF</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Commandes acceptées</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Reçus Encaissés (Wave/MoMo)
            </div>
            <div className="text-lg font-black font-mono text-emerald-300 mt-1">
              {totalReceiptsAmount.toLocaleString('fr-FR')}{' '}
              <span className="text-xs text-zinc-400 font-sans">XOF</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">{receipts.length} règlements perçus</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-300">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Soldes Restants Dûs
            </div>
            <div className="text-lg font-black font-mono text-amber-400 mt-1">
              {totalRemainingDue.toLocaleString('fr-FR')}{' '}
              <span className="text-xs text-zinc-400 font-sans">XOF</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">À percevoir à la livraison</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-zinc-900/80 border border-zinc-800 rounded-2xl">
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('proformas')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'proformas'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Factures Proforma ({proformas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('receipts')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'receipts'
                ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Reçus de Paiement ({receipts.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par client, numéro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* TAB 1: PROFORMAS LIST */}
      {activeTab === 'proformas' && (
        <div className="space-y-3">
          {filteredProformas.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-dashed border-zinc-800">
              <FileText className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-300">Aucune facture proforma pour le moment</p>
              <p className="text-xs text-zinc-500 mt-0.5">Créez votre premier devis estimatif avec TVA et détails prestations</p>
              <button
                onClick={onNewProforma}
                className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 text-zinc-950 hover:bg-amber-400 cursor-pointer shadow-sm"
              >
                Créer une Proforma
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredProformas.map((prof) => (
                <div
                  key={prof.id}
                  className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {prof.number}
                      </span>
                      <span className="text-sm font-bold text-zinc-100 truncate">{prof.title}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          prof.status === 'Acceptée & Signée'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : prof.status === 'Convertie en projet'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : prof.status === 'Refusée'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                        }`}
                      >
                        {prof.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="font-medium text-zinc-300">{prof.clientName}</span>
                        {prof.clientCompany && <span className="text-zinc-500">({prof.clientCompany})</span>}
                      </div>

                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Émise le {prof.date}</span>
                      </div>

                      <div className="text-zinc-500 text-[11px]">
                        {prof.items.length} prestation(s) chiffrée(s)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/80">
                    <div className="text-right">
                      <div className="text-base font-extrabold font-mono text-amber-400">
                        {prof.totalAmount.toLocaleString('fr-FR')}{' '}
                        <span className="text-xs font-sans text-zinc-400">XOF</span>
                      </div>
                      <div className="text-[10px] text-zinc-500">Net à payer</div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => downloadProformaFile(prof, workspace)}
                        className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                        title="Télécharger le fichier Devis / Proforma (HTML/PDF)"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => printDocumentWindow(generateProformaHTML(prof, workspace))}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        title="Imprimer / Enregistrer en PDF"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onCreateReceiptFromProforma(prof)}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-300 hover:text-emerald-200 transition-colors cursor-pointer"
                        title="Créer un reçu d'acompte pour cette proforma"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onEditProforma(prof)}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        title="Ouvrir & Éditer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteProforma(prof.id)}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Supprimer la proforma"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RECEIPTS LIST */}
      {activeTab === 'receipts' && (
        <div className="space-y-3">
          {filteredReceipts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-dashed border-zinc-800">
              <Receipt className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-300">Aucun reçu de paiement enregistré</p>
              <p className="text-xs text-zinc-500 mt-0.5">Délivrez des reçus officiels avec Wave, Orange Money ou virement bancaire</p>
              <button
                onClick={onNewReceipt}
                className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 text-zinc-950 hover:bg-emerald-400 cursor-pointer shadow-sm"
              >
                Générer un Reçu
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredReceipts.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {rec.receiptNumber}
                      </span>
                      <span className="text-sm font-bold text-zinc-100 truncate">
                        {rec.projectName || `Versement de ${rec.clientName}`}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {rec.paymentType}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="font-medium text-zinc-300">{rec.clientName}</span>
                        {rec.clientCompany && <span className="text-zinc-500">({rec.clientCompany})</span>}
                      </div>

                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Encaissé le {rec.date}</span>
                      </div>

                      <div className="text-zinc-400 flex items-center gap-1">
                        <span className="text-zinc-500">Mode :</span>
                        <span className="font-medium text-zinc-300">{rec.paymentMethod}</span>
                      </div>

                      {rec.paymentReference && (
                        <div className="text-zinc-500 font-mono text-[11px]">
                          Réf: {rec.paymentReference}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/80">
                    <div className="text-right">
                      <div className="text-base font-extrabold font-mono text-emerald-400">
                        {rec.amountPaid.toLocaleString('fr-FR')}{' '}
                        <span className="text-xs font-sans text-zinc-400">XOF</span>
                      </div>
                      {rec.remainingBalance > 0 && (
                        <div className="text-[10px] text-amber-400 font-mono">
                          Reste dû : {rec.remainingBalance.toLocaleString('fr-FR')} XOF
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => downloadReceiptFile(rec, workspace)}
                        className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                        title="Télécharger le Reçu officiel (Fichier HTML/PDF)"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => printDocumentWindow(generateReceiptHTML(rec, workspace))}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        title="Imprimer / Enregistrer en PDF"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onEditReceipt(rec)}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        title="Aperçu & Impression Reçu"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteReceipt(rec.id)}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Supprimer le reçu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
