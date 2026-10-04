import React, { useState } from 'react';
import {
  X,
  Printer,
  Save,
  Receipt,
  User,
  Building,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  CheckCircle2,
  FileCheck,
  Eye,
  ShieldCheck,
  Download,
  Image as ImageIcon,
} from 'lucide-react';
import {
  PaymentReceipt,
  PaymentMethod,
  ReceiptPaymentType,
  Project,
  Workspace,
  ProformaInvoice,
} from '../types';
import {
  downloadReceiptFile,
  printDocumentWindow,
  generateReceiptHTML,
} from '../utils/documentExport';

interface ReceiptModalProps {
  receipt?: PaymentReceipt | null;
  initialProforma?: ProformaInvoice | null;
  workspace: Workspace;
  projects: Project[];
  proformas: ProformaInvoice[];
  onClose: () => void;
  onSave: (receipt: PaymentReceipt) => void;
  onOpenLogoModal?: () => void;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  "Wave Côte d'Ivoire",
  'Orange Money',
  'MTN Mobile Money',
  'Espèces',
  'Virement bancaire',
  'Chèque',
  'Carte bancaire',
];

const PAYMENT_TYPES: ReceiptPaymentType[] = [
  'Acompte initial (50%)',
  'Acompte initial (30%)',
  'Règlement intermédiaire',
  'Solde final (100%)',
  'Paiement intégral',
];

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  receipt,
  initialProforma,
  workspace,
  projects,
  proformas,
  onClose,
  onSave,
  onOpenLogoModal,
}) => {
  const isEditing = !!receipt;
  const [viewMode, setViewMode] = useState<'form' | 'preview'>('form');

  // Form states
  const [receiptNumber, setReceiptNumber] = useState(
    receipt?.receiptNumber ||
      `RECU-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`
  );
  const [date, setDate] = useState(
    receipt?.date || new Date().toISOString().split('T')[0]
  );

  // Client info
  const [clientName, setClientName] = useState(
    receipt?.clientName || initialProforma?.clientName || ''
  );
  const [clientCompany, setClientCompany] = useState(
    receipt?.clientCompany || initialProforma?.clientCompany || ''
  );
  const [clientPhone, setClientPhone] = useState(
    receipt?.clientPhone || initialProforma?.clientPhone || ''
  );
  const [clientEmail, setClientEmail] = useState(
    receipt?.clientEmail || initialProforma?.clientEmail || ''
  );

  // Linked Project or Proforma
  const [selectedProjectId, setSelectedProjectId] = useState(
    receipt?.projectId || ''
  );
  const [projectName, setProjectName] = useState(
    receipt?.projectName || initialProforma?.title || ''
  );
  const [proformaNumber, setProformaNumber] = useState(
    receipt?.proformaNumber || initialProforma?.number || ''
  );

  // Financials
  const [totalProjectAmount, setTotalProjectAmount] = useState<number>(
    receipt?.totalProjectAmount || initialProforma?.totalAmount || 0
  );
  const [previouslyPaid, setPreviouslyPaid] = useState<number>(
    receipt?.previouslyPaid || 0
  );
  const [amountPaid, setAmountPaid] = useState<number>(
    receipt?.amountPaid ||
      (initialProforma ? Math.round(initialProforma.totalAmount * 0.5) : 0)
  );

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    receipt?.paymentMethod || "Wave Côte d'Ivoire"
  );
  const [paymentType, setPaymentType] = useState<ReceiptPaymentType>(
    receipt?.paymentType || 'Acompte initial (50%)'
  );
  const [paymentReference, setPaymentReference] = useState(
    receipt?.paymentReference || ''
  );
  const [receivedBy, setReceivedBy] = useState(
    receipt?.receivedBy || workspace.billingInfo.companyName
  );
  const [notes, setNotes] = useState(
    receipt?.notes || 'Règlement perçu et comptabilisé au studio. Merci pour votre confiance.'
  );

  // Quick link from projects
  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    const p = projects.find((proj) => proj.id === projectId);
    if (p) {
      setProjectName(p.name);
      setClientName(p.client);
      setClientCompany(p.client);
      if (p.clientEmail) setClientEmail(p.clientEmail);
      if (p.clientPhone) setClientPhone(p.clientPhone);
      setTotalProjectAmount(p.budget || 0);
      if (amountPaid === 0 && p.budget > 0) {
        setAmountPaid(Math.round(p.budget * 0.5));
      }
    }
  };

  // Quick link from proformas
  const handleSelectProforma = (profId: string) => {
    const prof = proformas.find((p) => p.id === profId);
    if (prof) {
      setProformaNumber(prof.number);
      setProjectName(prof.title);
      setClientName(prof.clientName);
      if (prof.clientCompany) setClientCompany(prof.clientCompany);
      if (prof.clientEmail) setClientEmail(prof.clientEmail);
      if (prof.clientPhone) setClientPhone(prof.clientPhone);
      setTotalProjectAmount(prof.totalAmount);
      setAmountPaid(Math.round(prof.totalAmount * 0.5));
    }
  };

  // Remaining balance
  const remainingBalance = Math.max(0, totalProjectAmount - previouslyPaid - amountPaid);

  const getCurrentReceiptState = (): PaymentReceipt => {
    return {
      id: receipt?.id || `receipt-${Date.now()}`,
      workspaceId: workspace.id,
      receiptNumber,
      date,
      clientName: clientName.trim() || 'Client Inconnu',
      clientCompany: clientCompany.trim() || undefined,
      clientPhone: clientPhone.trim() || undefined,
      clientEmail: clientEmail.trim() || undefined,
      projectId: selectedProjectId || undefined,
      projectName: projectName.trim() || undefined,
      proformaNumber: proformaNumber.trim() || undefined,
      amountPaid,
      paymentMethod,
      paymentType,
      totalProjectAmount,
      previouslyPaid,
      remainingBalance,
      paymentReference: paymentReference.trim() || undefined,
      receivedBy: receivedBy.trim(),
      notes: notes.trim() || undefined,
      createdAt: receipt?.createdAt || new Date().toISOString(),
    };
  };

  const handlePrint = () => {
    const current = getCurrentReceiptState();
    const html = generateReceiptHTML(current, workspace);
    printDocumentWindow(html);
  };

  const handleDownloadDocument = () => {
    const current = getCurrentReceiptState();
    downloadReceiptFile(current, workspace);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || amountPaid <= 0) return;

    const newReceipt = getCurrentReceiptState();
    onSave(newReceipt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {isEditing ? `Modifier Reçu : ${receiptNumber}` : 'Générer un Reçu de Paiement Client'}
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Franc CFA (XOF)
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Attestation officielle de règlement avec cachet et mentions légales</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-zinc-900 p-1 rounded-xl border border-zinc-800 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode('form')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'form'
                    ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Formulaire
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'preview'
                    ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Aperçu Reçu</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {viewMode === 'form' ? (
            <form id="receipt-form" onSubmit={handleSave} className="space-y-5">
              {/* Row 1: Header metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    N° de Reçu *
                  </label>
                  <input
                    type="text"
                    required
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg bg-zinc-900 border border-zinc-700 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Date du règlement *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Nature du versement
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as ReceiptPaymentType)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    {PAYMENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Linking with project / proforma */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Rattacher à un Projet (Optionnel)
                  </label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => handleSelectProject(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Aucun projet lié --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.client})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Ou rattacher à une Proforma
                  </label>
                  <select
                    onChange={(e) => handleSelectProforma(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Aucune proforma liée --</option>
                    {proformas.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.number} - {prof.clientName} ({prof.totalAmount.toLocaleString('fr-FR')} XOF)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Objet ou Titre de la prestation
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Création Identité Visuelle & Logo"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Client Information */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Informations du Client Dépositaire</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Nom complet du client *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ex: M. Koffi Samuel"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Entreprise / Société
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Saphir Holding"
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Téléphone client
                    </label>
                    <input
                      type="text"
                      placeholder="+225 07 00 00 00 00"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Email client
                    </label>
                    <input
                      type="email"
                      placeholder="client@domaine.ci"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Financial amounts & Payment methods */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Montants & Modalités d'Encaissement (XOF)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Montant encaissé sur ce reçu (XOF) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1000"
                      required
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm font-mono font-bold rounded-lg bg-zinc-900 border border-emerald-500 text-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Mode de paiement *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-emerald-500"
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      N° Transaction / Réf. Virement
                    </label>
                    <input
                      type="text"
                      placeholder="ex: WV-2026-9812938"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-zinc-800">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      Montant Total du Projet (XOF)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={totalProjectAmount}
                      onChange={(e) => setTotalProjectAmount(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      Déjà réglé auparavant (XOF)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={previouslyPaid}
                      onChange={(e) => setPreviouslyPaid(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 focus:outline-none"
                    />
                  </div>

                  <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col justify-center">
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                      Solde Restant Dû :
                    </span>
                    <span className="font-mono font-bold text-sm text-amber-400">
                      {remainingBalance.toLocaleString('fr-FR')} XOF
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Notes ou mention particulière
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>
            </form>
          ) : (
            /* PREVIEW / FORMAT IMPRIMABLE */
            <div className="bg-white text-zinc-950 p-8 sm:p-10 rounded-2xl shadow-xl max-w-2xl mx-auto font-sans print:p-0 print:shadow-none print:m-0 print:w-full">
              {/* Receipt Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-zinc-900 pb-5 gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    {workspace.logoUrl || workspace.billingInfo.logoUrl ? (
                      <div className="relative group">
                        <img
                          src={workspace.logoUrl || workspace.billingInfo.logoUrl}
                          alt="Logo Studio"
                          className="max-h-14 max-w-[170px] object-contain rounded-lg"
                        />
                        {onOpenLogoModal && (
                          <button
                            type="button"
                            onClick={onOpenLogoModal}
                            className="absolute -top-1 -right-1 p-1 bg-emerald-500 text-zinc-950 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold shadow"
                            title="Modifier le logo"
                          >
                            ✎
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-zinc-950 text-emerald-400 font-extrabold flex items-center justify-center font-mono text-base border border-zinc-800">
                        {workspace.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-extrabold text-zinc-900">
                          {workspace.billingInfo.companyName || workspace.name}
                        </h2>
                        {onOpenLogoModal && (
                          <button
                            type="button"
                            onClick={onOpenLogoModal}
                            className="text-[11px] text-emerald-700 hover:text-emerald-800 underline font-semibold flex items-center gap-1 cursor-pointer print:hidden"
                          >
                            <ImageIcon className="w-3 h-3" />
                            <span>{workspace.logoUrl ? 'Changer logo' : 'Insérer logo'}</span>
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500">{workspace.billingInfo.tagline || workspace.tagline}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-zinc-600 space-y-0.5">
                    <p>{workspace.billingInfo.address}, {workspace.billingInfo.city}</p>
                    <p>Tél : {workspace.billingInfo.phone}</p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 font-extrabold text-xs uppercase tracking-wider rounded-lg mb-1">
                    Reçu de Paiement
                  </div>
                  <div className="text-base font-extrabold font-mono text-zinc-900">{receiptNumber}</div>
                  <p className="text-xs text-zinc-500 mt-0.5">Date : {date}</p>
                </div>
              </div>

              {/* Payment Box */}
              <div className="my-6 p-5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Montant Encaissé ({paymentType})
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-900 mt-1">
                    {amountPaid.toLocaleString('fr-FR')} <span className="text-lg">XOF</span>
                  </div>
                  <p className="text-xs text-emerald-700 mt-0.5">Francs CFA (Côte d'Ivoire)</p>
                </div>

                <div className="text-left sm:text-right text-xs text-zinc-700 space-y-1">
                  <div>
                    <span className="text-zinc-500">Mode de paiement : </span>
                    <span className="font-bold text-zinc-900">{paymentMethod}</span>
                  </div>
                  {paymentReference && (
                    <div>
                      <span className="text-zinc-500">Réf. Transaction : </span>
                      <span className="font-mono font-bold text-zinc-800">{paymentReference}</span>
                    </div>
                  )}
                  {proformaNumber && (
                    <div>
                      <span className="text-zinc-500">Réf. Devis Proforma : </span>
                      <span className="font-mono font-bold text-zinc-800">{proformaNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Client and Project Details */}
              <div className="space-y-4 text-xs text-zinc-800 border-b border-zinc-200 pb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Reçu de :
                    </span>
                    <p className="font-bold text-sm text-zinc-900 mt-0.5">{clientName}</p>
                    {clientCompany && <p className="text-zinc-600">{clientCompany}</p>}
                    {clientPhone && <p className="text-zinc-600">Tél : {clientPhone}</p>}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Objet du versement :
                    </span>
                    <p className="font-semibold text-zinc-900 mt-0.5">
                      {projectName || "Prestation de service design et création"}
                    </p>
                  </div>
                </div>

                {/* Financial balance overview */}
                {totalProjectAmount > 0 && (
                  <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase font-semibold">Montant Total</div>
                      <div className="font-mono font-bold text-xs text-zinc-900 mt-0.5">
                        {totalProjectAmount.toLocaleString('fr-FR')} XOF
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase font-semibold">Cumul Réglé</div>
                      <div className="font-mono font-bold text-xs text-emerald-700 mt-0.5">
                        {(previouslyPaid + amountPaid).toLocaleString('fr-FR')} XOF
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase font-semibold">Reste à Payer</div>
                      <div className="font-mono font-bold text-xs text-amber-700 mt-0.5">
                        {remainingBalance.toLocaleString('fr-FR')} XOF
                      </div>
                    </div>
                  </div>
                )}

                {notes && <p className="text-zinc-500 italic text-[11px] pt-1">{notes}</p>}
              </div>

              {/* Signature & Digital Stamp */}
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="text-xs text-zinc-600 space-y-1">
                  <p className="font-bold text-zinc-900">Mention Légale :</p>
                  <p className="text-[11px] text-zinc-500 max-w-xs">
                    "Pour acquit de règlement sous réserve de bon encaissement définitif."
                  </p>
                </div>

                <div className="border-2 border-emerald-600 text-emerald-800 p-3 rounded-xl rotate-[-2deg] text-center font-mono">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-700">
                    ENCAISSÉ & VALIDÉ
                  </div>
                  <div className="text-xs font-black uppercase tracking-wider mt-0.5">
                    {workspace.name}
                  </div>
                  <div className="text-[9px] text-emerald-600 mt-0.5">
                    {date} • Côte d'Ivoire
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between gap-3">
          <div className="text-xs text-zinc-400 font-medium">
            Montant réglé :{' '}
            <span className="font-mono font-bold text-emerald-400">
              {amountPaid.toLocaleString('fr-FR')} XOF
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenLogoModal && (
              <button
                type="button"
                onClick={onOpenLogoModal}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-300 flex items-center gap-1.5 cursor-pointer"
                title="Insérer ou changer le logo"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{workspace.logoUrl ? 'Logo Studio ✓' : 'Insérer Logo'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadDocument}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Télécharger le fichier document prêt pour impression et partage client"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger Reçu</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Aperçu avant impression et export PDF du navigateur"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Imprimer / PDF</span>
            </button>

            <button
              type="submit"
              form="receipt-form"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Enregistrer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
