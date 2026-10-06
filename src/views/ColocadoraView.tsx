import React, { useState } from 'react';
import {
  Store,
  ClipboardCheck,
  AlertTriangle,
  Calendar,
  History,
  CheckCircle2,
  Camera,
  UploadCloud,
  Plus,
  ArrowRight,
} from 'lucide-react';
import {
  AppState,
  InventarioRegistro,
  MermaRegistro,
  VencimientoRegistro,
  User,
} from '../data/mockData';

interface ColocadoraViewProps {
  state: AppState;
  currentUser: User;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

type ColocadoraTab = 'inventario' | 'merma' | 'vencimiento' | 'historial';

export const ColocadoraView: React.FC<ColocadoraViewProps> = ({
  state,
  currentUser,
  onUpdateState,
}) => {
  const [activeTab, setActiveTab] = useState<ColocadoraTab>('inventario');

  // Colocadora profile
  const colocadora =
    state.colocadoras.find((c) => c.email === currentUser.email) || state.colocadoras[0];

  const assignedStores = state.tiendas.filter((t) =>
    colocadora.tiendasAsignadas.includes(t.id)
  );

  const [selectedTiendaId, setSelectedTiendaId] = useState(
    assignedStores[0]?.id || state.tiendas[0]?.id || ''
  );

  const [selectedEmpresaId, setSelectedEmpresaId] = useState(state.empresas[0]?.id || '');

  // Form: Inventario Físico
  // Strict rules: Enteros >= 0, sin letras, sin '00'
  const [quantities, setQuantities] = useState<{ [prodId: string]: string }>({});
  const [inventoryNotes, setInventoryNotes] = useState('');
  const [inventorySuccess, setInventorySuccess] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  // Form: Merma
  const [mermaProdId, setMermaProdId] = useState(state.productos[0]?.id || '');
  const [mermaPhotoUrl, setMermaPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80'
  );
  const [mermaDesc, setMermaDesc] = useState('');
  const [mermaSuccess, setMermaSuccess] = useState(false);

  // Form: Vencimiento
  const [vencProdId, setVencProdId] = useState(state.productos[0]?.id || '');
  const [vencFecha, setVencFecha] = useState(
    new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]
  );
  const [vencCantidad, setVencCantidad] = useState(1);
  const [vencSuccess, setVencSuccess] = useState(false);

  // Filter products by selected company
  const availableProducts = state.productos.filter((p) => p.empresaId === selectedEmpresaId);

  // Validate strict quantity format (integer >= 0, no decimals, no letters, no '00' or '000')
  const handleQuantityChange = (prodId: string, val: string) => {
    setInputError(null);

    // Rule: reject letters or symbols
    if (val !== '' && !/^\d+$/.test(val)) {
      setInputError('Solo se permiten números enteros positivos sin letras ni símbolos.');
      return;
    }

    // Rule: reject strictly '00', '000', etc.
    if (/^0\d+$/.test(val)) {
      setInputError('El formato "00" o ceros a la izquierda no está permitido.');
      return;
    }

    setQuantities((prev) => ({
      ...prev,
      [prodId]: val,
    }));
  };

  const handleSaveInventario = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);

    const detalles = availableProducts
      .map((p) => ({
        productoId: p.id,
        cantidadFisica: parseInt(quantities[p.id] || '0', 10),
      }))
      .filter((d) => !isNaN(d.cantidadFisica));

    if (detalles.length === 0) {
      setInputError('Debes contabilizar al menos un producto.');
      return;
    }

    const newInv: InventarioRegistro = {
      id: `inv_${Date.now()}`,
      fecha: new Date().toISOString().split('T')[0],
      colocadoraId: colocadora.id,
      tiendaId: selectedTiendaId,
      empresaId: selectedEmpresaId,
      observaciones: inventoryNotes,
      detalles,
    };

    onUpdateState((prev) => ({
      ...prev,
      inventarios: [newInv, ...prev.inventarios],
    }));

    setInventorySuccess(true);
    setQuantities({});
    setInventoryNotes('');
    setTimeout(() => setInventorySuccess(false), 3000);
  };

  const handleSaveMerma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mermaDesc.trim()) return;

    const newMerma: MermaRegistro = {
      id: `merma_${Date.now()}`,
      fecha: new Date().toISOString().split('T')[0],
      colocadoraId: colocadora.id,
      tiendaId: selectedTiendaId,
      empresaId: selectedEmpresaId,
      productoId: mermaProdId,
      imagenUrl: mermaPhotoUrl,
      descripcion: mermaDesc,
    };

    onUpdateState((prev) => ({
      ...prev,
      mermas: [newMerma, ...prev.mermas],
    }));

    setMermaSuccess(true);
    setMermaDesc('');
    setTimeout(() => setMermaSuccess(false), 3000);
  };

  const handleSaveVencimiento = (e: React.FormEvent) => {
    e.preventDefault();
    if (vencCantidad <= 0) return;

    const newVenc: VencimientoRegistro = {
      id: `venc_${Date.now()}`,
      fechaRegistro: new Date().toISOString().split('T')[0],
      fechaVencimiento: vencFecha,
      colocadoraId: colocadora.id,
      tiendaId: selectedTiendaId,
      empresaId: selectedEmpresaId,
      productoId: vencProdId,
      cantidad: vencCantidad,
    };

    onUpdateState((prev) => ({
      ...prev,
      vencimientos: [newVenc, ...prev.vencimientos],
    }));

    setVencSuccess(true);
    setTimeout(() => setVencSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner: Worker and Store selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Módulo de Campo
            </span>
            <h2 className="text-xl font-bold text-white mt-1.5">{colocadora.nombre}</h2>
            <p className="text-xs text-slate-400 font-mono">DPI: {colocadora.dpi}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Supermercado Actual:
            </label>
            <select
              value={selectedTiendaId}
              onChange={(e) => setSelectedTiendaId(e.target.value)}
              className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500"
            >
              {assignedStores.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('inventario')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'inventario'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Toma Inventario</span>
        </button>

        <button
          onClick={() => setActiveTab('merma')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'merma'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Reportar Merma</span>
        </button>

        <button
          onClick={() => setActiveTab('vencimiento')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'vencimiento'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Vencimientos</span>
        </button>

        <button
          onClick={() => setActiveTab('historial')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'historial'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Mi Historial</span>
        </button>
      </div>

      {/* TAB 1: TOMA DE INVENTARIO */}
      {activeTab === 'inventario' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Conteo Físico en Góndola</h3>
              <p className="text-xs text-slate-400">Ingresa la cantidad física de cada SKU en la tienda</p>
            </div>

            {/* Provider selector */}
            <select
              value={selectedEmpresaId}
              onChange={(e) => setSelectedEmpresaId(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-amber-400 font-semibold"
            >
              {state.empresas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </div>

          {inputError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
              {inputError}
            </div>
          )}

          {inventorySuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              ¡Inventario registrado exitosamente!
            </div>
          )}

          <form onSubmit={handleSaveInventario} className="space-y-4">
            <div className="space-y-3">
              {availableProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    {p.imagenUrl && (
                      <img src={p.imagenUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    )}
                    <div>
                      <div className="text-xs font-semibold text-white">{p.nombre}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Código U: {p.codigoU} • Barras: {p.codigoBarras}
                      </div>
                    </div>
                  </div>

                  <div className="w-28 shrink-0">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={quantities[p.id] ?? ''}
                      onChange={(e) => handleQuantityChange(p.id, e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 text-center text-sm font-bold bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Observaciones en Góndola</label>
              <textarea
                rows={2}
                value={inventoryNotes}
                onChange={(e) => setInventoryNotes(e.target.value)}
                placeholder="Ej. Espacio suficiente en cabecera de pasillo."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
            >
              <ClipboardCheck className="w-4 h-4" />
              Guardar Conteo de Inventario
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: MERMAS / PRODUCTO EN MAL ESTADO */}
      {activeTab === 'merma' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-base font-bold text-white">Reporte de Producto en Mal Estado con Fotografía</h3>

          {mermaSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              ¡Reporte de merma guardado con éxito!
            </div>
          )}

          <form onSubmit={handleSaveMerma} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Producto Afectado</label>
              <select
                value={mermaProdId}
                onChange={(e) => setMermaProdId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                {state.productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} ({p.codigoU})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Evidencia Fotográfica Obligatoria</label>
              <div className="flex items-center gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
                <img src={mermaPhotoUrl} alt="Preview" className="w-20 h-20 rounded-xl object-cover" />
                <div className="space-y-2 flex-1">
                  <input
                    type="text"
                    value={mermaPhotoUrl}
                    onChange={(e) => setMermaPhotoUrl(e.target.value)}
                    placeholder="URL de fotografía"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                  />
                  <span className="text-[10px] text-slate-400 block">Fotografía cargada como evidencia para reclamo</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Descripción del Daño</label>
              <textarea
                required
                rows={3}
                value={mermaDesc}
                onChange={(e) => setMermaDesc(e.target.value)}
                placeholder="Detalla cómo ocurrió o el daño visible (ej. empaque roto durante acomodo, rotura de botella, etc.)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-red-600/25 flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Enviar Reporte de Merma
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: REGISTRO DE VENCIMIENTOS */}
      {activeTab === 'vencimiento' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-base font-bold text-white">Registro de Fechas de Vencimiento de Lote</h3>

          {vencSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              ¡Fecha de vencimiento registrada!
            </div>
          )}

          <form onSubmit={handleSaveVencimiento} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Producto</label>
              <select
                value={vencProdId}
                onChange={(e) => setVencProdId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                {state.productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} ({p.codigoU})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Fecha de Vencimiento del Lote</label>
                <input
                  type="date"
                  required
                  value={vencFecha}
                  onChange={(e) => setVencFecha(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Cantidad de Unidades</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={vencCantidad}
                  onChange={(e) => setVencCantidad(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Guardar Registro de Vencimiento
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: HISTORIAL DE LA COLOCADORA */}
      {activeTab === 'historial' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white">Mis Registros Recientes en Tiendas</h3>

          <div className="space-y-3">
            {state.inventarios
              .filter((inv) => inv.colocadoraId === colocadora.id)
              .map((inv) => {
                const tienda = state.tiendas.find((t) => t.id === inv.tiendaId);
                const count = inv.detalles.reduce((a, b) => a + b.cantidadFisica, 0);

                return (
                  <div key={inv.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white text-xs">{tienda?.nombre}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{inv.fecha} • {inv.detalles.length} referencias</div>
                    </div>
                    <div className="text-xs font-bold text-emerald-400">{count} un.</div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
