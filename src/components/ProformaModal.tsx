import React, { useState } from 'react';
import {
  X,
  Printer,
  Save,
  Plus,
  Trash2,
  FileText,
  Building,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Eye,
  Receipt,
  Download,
  Image as ImageIcon,
} from 'lucide-react';
import {
  ProformaInvoice,
  ProformaItem,
  Project,
  Workspace,
  ProformaStatus,
} from '../types';
import {
  downloadProformaFile,
  printDocumentWindow,
  generateProformaHTML,
} from '../utils/documentExport';

interface ProformaModalProps {
  proforma?: ProformaInvoice | null;
  workspace: Workspace;
  projects: Project[];
  onClose: () => void;
  onSave: (proforma: ProformaInvoice) => void;
  onCreateReceiptFromProforma?: (proforma: ProformaInvoice) => void;
  onOpenLogoModal?: () => void;
}

export const ProformaModal: React.FC<ProformaModalProps> = ({
  proforma,
  workspace,
  projects,
  onClose,
  onSave,
  onCreateReceiptFromProforma,
  onOpenLogoModal,
}) => {
  const isEditing = !!proforma;
  const [viewMode, setViewMode] = useState<'form' | 'preview'>('form');

  // Form states
  const [number, setNumber] = useState(
    proforma?.number || `PROFORMA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`
  );
  const [title, setTitle] = useState(
    proforma?.title || "Prestation de Design & Création d'Identité Visuelle"
  );
  const [date, setDate] = useState(
    proforma?.date || new Date().toISOString().split('T')[0]
  );
  const [validUntil, setValidUntil] = useState(
    proforma?.validUntil ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<ProformaStatus>(proforma?.status || 'Brouillon');

  // Client info
  const [clientName, setClientName] = useState(proforma?.clientName || '');
  const [clientCompany, setClientCompany] = useState(proforma?.clientCompany || '');
  const [clientEmail, setClientEmail] = useState(proforma?.clientEmail || '');
  const [clientPhone, setClientPhone] = useState(proforma?.clientPhone || '');
  const [clientAddress, setClientAddress] = useState(
    proforma?.clientAddress || 'Abidjan, Côte d\'Ivoire'
  );

  // Prestation items
  const [items, setItems] = useState<ProformaItem[]>(
    proforma?.items && proforma.items.length > 0
      ? proforma.items
      : [
          {
            id: 'item-1',
            description: 'Conception de Logo, Charte Graphique & Déclinaisons de marque',
            quantity: 1,
            unitPrice: 350000,
            total: 350000,
          },
          {
            id: 'item-2',
            description: 'Création des supports Print & Réseaux Sociaux (Bannières, Cartes)',
            quantity: 1,
            unitPrice: 150000,
            total: 150000,
          },
        ]
  );

  const [discountPercent, setDiscountPercent] = useState<number>(proforma?.discountPercent || 0);
  const [taxPercent, setTaxPercent] = useState<number>(proforma?.taxPercent || 0);
  const [paymentTerms, setPaymentTerms] = useState(
    proforma?.paymentTerms ||
      'Acompte de 50% à la validation de la commande, solde de 50% à la livraison finale des fichiers sources.'
  );
  const [paymentMethods, setPaymentMethods] = useState(
    proforma?.paymentMethods ||
      workspace.billingInfo.bankOrMobileMoney ||
      'Wave Côte d\'Ivoire & Orange Money : +225 07 88 99 00 11 | Virement bancaire'
  );
  const [notes, setNotes] = useState(
    proforma?.notes || 'Validité de cette proforma : 30 jours calendaires. Livrables haute définition vectoriels et maquettes incluses.'
  );

  // Quick Client Selection from projects
  const handleSelectClient = (projectName: string) => {
    const proj = projects.find((p) => p.name === projectName || p.client === projectName);
    if (proj) {
      setClientName(proj.client);
      setClientCompany(proj.client);
      if (proj.clientEmail) setClientEmail(proj.clientEmail);
      if (proj.clientPhone) setClientPhone(proj.clientPhone);
    }
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxAmount = Math.round(subtotalAfterDiscount * (taxPercent / 100));
  const totalAmount = subtotalAfterDiscount + taxAmount;

  const handleItemChange = (index: number, field: keyof ProformaItem, value: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      current.total = (Number(current.quantity) || 0) * (Number(current.unitPrice) || 0);
    }
    updated[index] = current;
    setItems(updated);
  };

  const handleAddItem = () => {
    const newItem: ProformaItem = {
      id: `item-${Date.now()}`,
      description: 'Nouvelle prestation créative',
      quantity: 1,
      unitPrice: 50000,
      total: 50000,
    };
    setItems([...items, newItem]);
  };

  const handleDeleteItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const getCurrentProformaState = (): ProformaInvoice => {
    return {
      id: proforma?.id || `proforma-${Date.now()}`,
      workspaceId: workspace.id,
      number,
      title,
      date,
      validUntil,
      clientName: clientName.trim() || 'Client Inconnu',
      clientCompany: clientCompany.trim() || undefined,
      clientEmail: clientEmail.trim() || undefined,
      clientPhone: clientPhone.trim() || undefined,
      clientAddress: clientAddress.trim() || undefined,
      items,
      subtotal,
      discountPercent,
      taxPercent,
      totalAmount,
      paymentTerms,
      paymentMethods,
      notes,
      status,
      createdAt: proforma?.createdAt || new Date().toISOString(),
    };
  };

  const handlePrint = () => {
    const current = getCurrentProformaState();
    const html = generateProformaHTML(current, workspace);
    printDocumentWindow(html);
  };

  const handleDownloadDocument = () => {
    const current = getCurrentProformaState();
    downloadProformaFile(current, workspace);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    const savedProforma = getCurrentProformaState();
    onSave(savedProforma);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {isEditing ? `Modifier Facture Proforma : ${number}` : 'Nouvelle Facture Proforma / Devis'}
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Franc CFA (XOF)
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Émission de devis estimatifs avec TVA, remises et calculs automatiques</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-zinc-900 p-1 rounded-xl border border-zinc-800 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode('form')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'form'
                    ? 'bg-zinc-800 text-amber-400 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Édition
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'preview'
                    ? 'bg-zinc-800 text-amber-400 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Aperçu PDF</span>
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
            <form id="proforma-form" onSubmit={handleSave} className="space-y-6">
              {/* Row 1: Header metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    N° de Proforma *
                  </label>
                  <input
                    type="text"
                    required
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg bg-zinc-900 border border-zinc-700 text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Objet de la prestation / Devis *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Statut du devis
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProformaStatus)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Brouillon">Brouillon</option>
                    <option value="Envoyée au client">Envoyée au client</option>
                    <option value="Acceptée & Signée">Acceptée & Signée</option>
                    <option value="Refusée">Refusée</option>
                    <option value="Convertie en projet">Convertie en projet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Date d'émission
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Validité jusqu'au
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Sélection rapide d'un client existant
                  </label>
                  <select
                    onChange={(e) => handleSelectClient(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Choisir un client parmi les projets --</option>
                    {Array.from(new Set(projects.map((p) => p.client))).map((client) => (
                      <option key={client} value={client}>
                        {client}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Client information */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Informations du Client / Destinataire</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Nom du Client / Contact *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ex: M. Kouassi Jean"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Entreprise / Société
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Ivoire Tech SAS"
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Email client
                    </label>
                    <input
                      type="email"
                      placeholder="client@entreprise.ci"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
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
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Adresse géographique client
                    </label>
                    <input
                      type="text"
                      placeholder="Plateau, Immeuble Horizon, Abidjan"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Items / Prestations */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Lignes de Prestations & Tarification (XOF)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter une ligne</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-zinc-500 uppercase px-2">
                    <span className="col-span-6">Description</span>
                    <span className="col-span-2 text-center">Quantité</span>
                    <span className="col-span-2 text-right">P.U. (XOF)</span>
                    <span className="col-span-2 text-right">Total (XOF)</span>
                  </div>

                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg bg-zinc-900/80 border border-zinc-800"
                    >
                      <div className="col-span-6 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(index)}
                          className="text-zinc-500 hover:text-rose-400 p-1 cursor-pointer shrink-0"
                          title="Supprimer la ligne"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="w-full px-2.5 py-1 text-xs rounded bg-zinc-950 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, 'quantity', Number(e.target.value) || 1)
                          }
                          className="w-full px-2 py-1 text-xs text-center rounded bg-zinc-950 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          required
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(index, 'unitPrice', Number(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1 text-xs text-right font-mono rounded bg-zinc-950 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="col-span-2 text-right font-mono font-bold text-xs text-amber-400 pr-1">
                        {item.total.toLocaleString('fr-FR')} XOF
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals & Discounts calculation */}
                <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Remise commerciale (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
                        className="w-24 px-2 py-1 text-xs font-mono rounded bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">TVA / Taxe (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={taxPercent}
                        onChange={(e) => setTaxPercent(Number(e.target.value) || 0)}
                        className="w-24 px-2 py-1 text-xs font-mono rounded bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="w-full sm:w-64 space-y-1.5 text-xs text-right">
                    <div className="flex justify-between text-zinc-400">
                      <span>Total Brut HT :</span>
                      <span className="font-mono">{subtotal.toLocaleString('fr-FR')} XOF</span>
                    </div>
                    {discountPercent > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Remise ({discountPercent}%) :</span>
                        <span className="font-mono">- {discountAmount.toLocaleString('fr-FR')} XOF</span>
                      </div>
                    )}
                    {taxPercent > 0 && (
                      <div className="flex justify-between text-zinc-400">
                        <span>TVA ({taxPercent}%) :</span>
                        <span className="font-mono">+ {taxAmount.toLocaleString('fr-FR')} XOF</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                      <span>Net à Payer :</span>
                      <span className="font-mono text-amber-400 text-base">
                        {totalAmount.toLocaleString('fr-FR')} XOF
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment conditions & notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Modalités de règlement
                  </label>
                  <textarea
                    rows={2}
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full p-2 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Moyens de paiement acceptés (Wave, MoMo, Banque)
                  </label>
                  <textarea
                    rows={2}
                    value={paymentMethods}
                    onChange={(e) => setPaymentMethods(e.target.value)}
                    className="w-full p-2 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </form>
          ) : (
            /* PREVIEW MODE / IMPRIMABLE */
            <div className="bg-white text-zinc-950 p-8 sm:p-10 rounded-2xl shadow-xl max-w-3xl mx-auto font-sans print:p-0 print:shadow-none print:m-0 print:w-full">
              {/* Proforma Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-zinc-200 pb-6">
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
                            className="absolute -top-1 -right-1 p-1 bg-amber-500 text-zinc-950 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold shadow"
                            title="Modifier le logo"
                          >
                            ✎
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-zinc-950 text-amber-400 font-extrabold flex items-center justify-center font-mono text-lg border border-zinc-800">
                        {workspace.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-xl font-extrabold tracking-tight text-zinc-900">
                          {workspace.billingInfo.companyName || workspace.name}
                        </h1>
                        {onOpenLogoModal && (
                          <button
                            type="button"
                            onClick={onOpenLogoModal}
                            className="text-[11px] text-amber-600 hover:text-amber-700 underline font-semibold flex items-center gap-1 cursor-pointer print:hidden"
                          >
                            <ImageIcon className="w-3 h-3" />
                            <span>{workspace.logoUrl ? 'Changer logo' : 'Insérer logo'}</span>
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500">{workspace.billingInfo.tagline || workspace.tagline}</p>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-zinc-600 space-y-0.5">
                    <p>{workspace.billingInfo.address}, {workspace.billingInfo.city}</p>
                    <p>Tél : {workspace.billingInfo.phone} | {workspace.billingInfo.email}</p>
                    {workspace.billingInfo.taxId && <p>RCCM/CC : {workspace.billingInfo.taxId}</p>}
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs uppercase tracking-wider rounded-lg mb-2">
                    Facture Proforma
                  </div>
                  <div className="text-base font-extrabold font-mono text-zinc-900">{number}</div>
                  <p className="text-xs text-zinc-500 mt-1">Date : {date}</p>
                  <p className="text-xs text-zinc-500">Valable jusqu'au : {validUntil}</p>
                </div>
              </div>

              {/* Client Box */}
              <div className="my-6 p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Facturé à :
                  </span>
                  <div className="text-sm font-bold text-zinc-900 mt-0.5">{clientName}</div>
                  {clientCompany && <div className="text-xs font-semibold text-zinc-700">{clientCompany}</div>}
                  {clientAddress && <div className="text-xs text-zinc-600 mt-1">{clientAddress}</div>}
                </div>

                <div className="text-left sm:text-right text-xs text-zinc-600 space-y-0.5">
                  {clientEmail && <p>Email : {clientEmail}</p>}
                  {clientPhone && <p>Tél : {clientPhone}</p>}
                  <p className="font-semibold text-zinc-800 mt-2">Objet : {title}</p>
                </div>
              </div>

              {/* Prestation Table */}
              <div className="my-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-zinc-900 text-[11px] uppercase font-extrabold text-zinc-700">
                      <th className="py-2.5 px-2">Désignation des Prestations</th>
                      <th className="py-2.5 px-2 text-center w-20">Qté</th>
                      <th className="py-2.5 px-2 text-right w-32">Prix Unitaire</th>
                      <th className="py-2.5 px-2 text-right w-36">Total (XOF)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-xs text-zinc-800">
                    {items.map((it) => (
                      <tr key={it.id}>
                        <td className="py-3 px-2 font-medium">{it.description}</td>
                        <td className="py-3 px-2 text-center font-mono">{it.quantity}</td>
                        <td className="py-3 px-2 text-right font-mono">
                          {it.unitPrice.toLocaleString('fr-FR')} XOF
                        </td>
                        <td className="py-3 px-2 text-right font-mono font-bold">
                          {it.total.toLocaleString('fr-FR')} XOF
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-zinc-200 pt-4">
                <div className="text-xs text-zinc-600 space-y-2 max-w-sm">
                  <div>
                    <span className="font-bold text-zinc-900">Conditions de règlement :</span>
                    <p className="mt-0.5">{paymentTerms}</p>
                  </div>
                  <div>
                    <span className="font-bold text-zinc-900">Modes de règlement :</span>
                    <p className="mt-0.5">{paymentMethods}</p>
                  </div>
                </div>

                <div className="w-full sm:w-64 space-y-1.5 text-xs text-right">
                  <div className="flex justify-between text-zinc-600">
                    <span>Total Brut HT :</span>
                    <span className="font-mono font-bold">{subtotal.toLocaleString('fr-FR')} XOF</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Remise ({discountPercent}%) :</span>
                      <span className="font-mono font-bold">- {discountAmount.toLocaleString('fr-FR')} XOF</span>
                    </div>
                  )}
                  {taxPercent > 0 && (
                    <div className="flex justify-between text-zinc-600">
                      <span>TVA ({taxPercent}%) :</span>
                      <span className="font-mono font-bold">+ {taxAmount.toLocaleString('fr-FR')} XOF</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-extrabold text-zinc-950 pt-2 border-t-2 border-zinc-900">
                    <span>NET À PAYER :</span>
                    <span className="font-mono text-amber-600">
                      {totalAmount.toLocaleString('fr-FR')} XOF
                    </span>
                  </div>
                </div>
              </div>

              {/* Signatures & Stamp */}
              <div className="mt-10 pt-6 border-t border-zinc-200 grid grid-cols-2 gap-8 text-xs text-zinc-600">
                <div>
                  <p className="font-bold text-zinc-900">Mention & Bon pour Accord Client :</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Date, signature et cachet précédés de "Bon pour accord"</p>
                  <div className="h-16 mt-2 border border-dashed border-zinc-300 rounded-lg" />
                </div>

                <div className="text-right">
                  <p className="font-bold text-zinc-900">Pour le Studio {workspace.name} :</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Direction Artistique & Gestion Commerciale</p>
                  <div className="h-16 mt-2 flex items-center justify-end">
                    <div className="border-2 border-amber-500/40 text-amber-800 text-[10px] font-mono px-3 py-1.5 rounded-lg rotate-[-4deg] uppercase tracking-wider font-extrabold">
                      Cachet Officiel • SIDIBE STUDIO CI
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-zinc-400 font-medium">
            Montant total du devis :{' '}
            <span className="font-mono font-bold text-amber-400">
              {totalAmount.toLocaleString('fr-FR')} XOF
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenLogoModal && (
              <button
                type="button"
                onClick={onOpenLogoModal}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 flex items-center gap-1.5 cursor-pointer"
                title="Insérer ou changer le logo"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{workspace.logoUrl ? 'Logo Studio ✓' : 'Insérer Logo'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadDocument}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Télécharger le fichier document prêt pour impression et partage client"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger Devis</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Aperçu avant impression et export PDF du navigateur"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Imprimer / PDF</span>
            </button>

            {onCreateReceiptFromProforma && (
              <button
                type="button"
                onClick={() => {
                  const p = getCurrentProformaState();
                  onCreateReceiptFromProforma(p);
                }}
                className="px-3 py-2 text-xs font-medium rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 cursor-pointer"
                title="Générer directement un reçu d'acompte pour ce devis"
              >
                <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Créer Reçu</span>
              </button>
            )}

            <button
              type="submit"
              form="proforma-form"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
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
