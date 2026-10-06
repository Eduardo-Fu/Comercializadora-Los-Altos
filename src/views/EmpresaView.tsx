import React, { useState } from 'react';
import {
  Building2,
  TrendingUp,
  Store,
  AlertOctagon,
  CalendarClock,
  Sparkles,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import { AppState, User } from '../data/mockData';

interface EmpresaViewProps {
  state: AppState;
  currentUser: User;
}

export const EmpresaView: React.FC<EmpresaViewProps> = ({ state, currentUser }) => {
  // Find current company (default to Irex)
  const empresa =
    state.empresas.find((e) => e.email === currentUser.email) ||
    state.empresas.find((e) => e.id === currentUser.empresaId) ||
    state.empresas[0];

  const [activeReport, setActiveReport] = useState<
    'existencias' | 'rotacion' | 'mermas' | 'vencimientos' | 'sugeridos'
  >('existencias');

  // Filter ONLY products belonging to this company (Strict isolation!)
  const myProducts = state.productos.filter((p) => p.empresaId === empresa.id);
  const myProductIds = myProducts.map((p) => p.id);

  // Filter records
  const myInventarios = state.inventarios.filter((inv) => inv.empresaId === empresa.id);
  const myMermas = state.mermas.filter(
    (m) => m.empresaId === empresa.id || myProductIds.includes(m.productoId)
  );
  const myVencimientos = state.vencimientos.filter(
    (v) => v.empresaId === empresa.id || myProductIds.includes(v.productoId)
  );
  const mySugeridos = state.sugeridos.filter(
    (s) => s.empresaId === empresa.id || myProductIds.includes(s.productoId)
  );

  // Compute rotation / turnover analysis
  const rotationStats = myProducts.map((prod) => {
    let totalContado = 0;
    let occurrences = 0;

    myInventarios.forEach((inv) => {
      const match = inv.detalles.find((d) => d.productoId === prod.id);
      if (match) {
        totalContado += match.cantidadFisica;
        occurrences++;
      }
    });

    const average = occurrences > 0 ? Math.round(totalContado / occurrences) : 0;
    const classification = average > 30 ? 'ALTA' : average >= 15 ? 'MEDIA' : 'BAJA';

    return {
      producto: prod,
      promedio: average,
      clasificacion: classification,
    };
  });

  // Export CSV function
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeReport === 'existencias') {
      csvContent += 'Producto,Codigo U,Supermercado,Unidades Fisicas,Ultima Fecha\n';
      state.tiendas.forEach((t) => {
        myProducts.forEach((p) => {
          const invMatch = myInventarios.find((i) => i.tiendaId === t.id);
          const det = invMatch?.detalles.find((d) => d.productoId === p.id);
          const count = det?.cantidadFisica || 0;
          csvContent += `"${p.nombre}","${p.codigoU}","${t.nombre}",${count},"${invMatch?.fecha || 'N/A'}"\n`;
        });
      });
    } else if (activeReport === 'rotacion') {
      csvContent += 'Producto,Codigo U,Promedio en Gondola,Clasificacion Rotacion\n';
      rotationStats.forEach((r) => {
        csvContent += `"${r.producto.nombre}","${r.producto.codigoU}",${r.promedio},"${r.clasificacion}"\n`;
      });
    } else if (activeReport === 'mermas') {
      csvContent += 'Fecha,Supermercado,Producto,Descripcion Merma\n';
      myMermas.forEach((m) => {
        const prod = myProducts.find((p) => p.id === m.productoId);
        const tienda = state.tiendas.find((t) => t.id === m.tiendaId);
        csvContent += `"${m.fecha}","${tienda?.nombre}","${prod?.nombre}","${m.descripcion.replace(/"/g, '""')}"\n`;
      });
    } else if (activeReport === 'vencimientos') {
      csvContent += 'Producto,Supermercado,Cantidad,Fecha Vencimiento\n';
      myVencimientos.forEach((v) => {
        const prod = myProducts.find((p) => p.id === v.productoId);
        const tienda = state.tiendas.find((t) => t.id === v.tiendaId);
        csvContent += `"${prod?.nombre}","${tienda?.nombre}",${v.cantidad},"${v.fechaVencimiento}"\n`;
      });
    } else {
      csvContent += 'Fecha,Supermercado,Producto,Cantidad Sugerida,Notas\n';
      mySugeridos.forEach((s) => {
        const prod = myProducts.find((p) => p.id === s.productoId);
        const tienda = state.tiendas.find((t) => t.id === s.tiendaId);
        csvContent += `"${s.fecha}","${tienda?.nombre}","${prod?.nombre}",${s.cantidadSugerida},"${s.notas || ''}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_${empresa.nombre.toLowerCase().replace(/\s+/g, '_')}_${activeReport}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Brand Header */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/20 p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Portal de Marcas Proveedoras
              </span>
              <span className="text-xs text-slate-400">Aislamiento de Datos Activo</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1.5">{empresa.nombre}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Visualizando métricas exclusivas para tus {myProducts.length} productos en góndolas de supermercados independientes.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-600/20 transition shrink-0"
          >
            <Download className="w-4 h-4" />
            Descargar Reporte CSV
          </button>
        </div>
      </div>

      {/* Sub-report selector tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
        <button
          onClick={() => setActiveReport('existencias')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeReport === 'existencias'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Store className="w-4 h-4" />
          Existencias por Tienda
        </button>

        <button
          onClick={() => setActiveReport('rotacion')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeReport === 'rotacion'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Análisis de Rotación
        </button>

        <button
          onClick={() => setActiveReport('mermas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeReport === 'mermas'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          Mermas ({myMermas.length})
        </button>

        <button
          onClick={() => setActiveReport('vencimientos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeReport === 'vencimientos'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          Vencimientos ({myVencimientos.length})
        </button>

        <button
          onClick={() => setActiveReport('sugeridos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeReport === 'sugeridos'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Sugeridos ({mySugeridos.length})
        </button>
      </div>

      {/* REPORT 1: EXISTENCIAS POR TIENDA */}
      {activeReport === 'existencias' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Matriz de Inventario en Góndola por Punto de Venta</h3>
            <span className="text-xs text-slate-400">Actualizado con las últimas tomas de campo</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4">Código U</th>
                  {state.tiendas.map((t) => (
                    <th key={t.id} className="py-3 px-4 text-center">
                      {t.nombre}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {myProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-semibold text-white">{p.nombre}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{p.codigoU}</td>
                    {state.tiendas.map((t) => {
                      const inv = myInventarios.find((i) => i.tiendaId === t.id);
                      const det = inv?.detalles.find((d) => d.productoId === p.id);
                      const count = det?.cantidadFisica || 0;

                      return (
                        <td key={t.id} className="py-3.5 px-4 text-center font-bold">
                          <span
                            className={`px-2 py-1 rounded ${
                              count > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {count} un.
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 2: ANÁLISIS DE ROTACIÓN */}
      {activeReport === 'rotacion' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="text-xs text-slate-400">Clasificación Alta Rotación</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">Mayor a 30 unidades</div>
              <p className="text-[11px] text-slate-500 mt-1">Artículos con flujo constante en supermercados</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="text-xs text-slate-400">Clasificación Media Rotación</div>
              <div className="text-xl font-bold text-amber-400 mt-1">15 a 30 unidades</div>
              <p className="text-[11px] text-slate-500 mt-1">Artículos con demanda estable</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="text-xs text-slate-400">Clasificación Baja Rotación</div>
              <div className="text-xl font-bold text-red-400 mt-1">Menor a 15 unidades</div>
              <p className="text-[11px] text-slate-500 mt-1">Artículos que requieren promociones o impulso</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4">Código U</th>
                  <th className="py-3 px-4">Promedio Físico Registrado</th>
                  <th className="py-3 px-4">Clasificación de Comportamiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {rotationStats.map((r) => (
                  <tr key={r.producto.id} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-semibold text-white">{r.producto.nombre}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{r.producto.codigoU}</td>
                    <td className="py-3.5 px-4 font-bold text-white">{r.promedio} unidades</td>
                    <td className="py-3.5 px-4">
                      {r.clasificacion === 'ALTA' ? (
                        <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                          ALTA ROTACIÓN
                        </span>
                      ) : r.clasificacion === 'MEDIA' ? (
                        <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                          MEDIA ROTACIÓN
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded bg-red-500/10 text-red-400 font-bold border border-red-500/20">
                          BAJA ROTACIÓN
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 3: MERMAS */}
      {activeReport === 'mermas' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Supermercado</th>
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4">Evidencia Fotográfica</th>
                <th className="py-3 px-4">Descripción del Daño</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {myMermas.map((m) => {
                const prod = myProducts.find((p) => p.id === m.productoId);
                const tienda = state.tiendas.find((t) => t.id === m.tiendaId);

                return (
                  <tr key={m.id} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-mono text-slate-300">{m.fecha}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{tienda?.nombre}</td>
                    <td className="py-3.5 px-4 text-slate-300">{prod?.nombre}</td>
                    <td className="py-3.5 px-4">
                      <img src={m.imagenUrl} alt="Merma" className="w-12 h-12 rounded-lg object-cover" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{m.descripcion}</td>
                  </tr>
                );
              })}
              {myMermas.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No se han registrado mermas para los productos de esta empresa.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* REPORT 4: VENCIMIENTOS */}
      {activeReport === 'vencimientos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4">Supermercado</th>
                <th className="py-3 px-4">Cantidad</th>
                <th className="py-3 px-4">Fecha Vencimiento</th>
                <th className="py-3 px-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {myVencimientos.map((v) => {
                const prod = myProducts.find((p) => p.id === v.productoId);
                const tienda = state.tiendas.find((t) => t.id === v.tiendaId);

                return (
                  <tr key={v.id} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-semibold text-white">{prod?.nombre}</td>
                    <td className="py-3.5 px-4 text-slate-300">{tienda?.nombre}</td>
                    <td className="py-3.5 px-4 font-bold text-white">{v.cantidad} un.</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{v.fechaVencimiento}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                        POR VENCER
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* REPORT 5: PEDIDOS SUGERIDOS */}
      {activeReport === 'sugeridos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Supermercado</th>
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4">Cantidad Sugerida</th>
                <th className="py-3 px-4">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {mySugeridos.map((s) => {
                const prod = myProducts.find((p) => p.id === s.productoId);
                const tienda = state.tiendas.find((t) => t.id === s.tiendaId);

                return (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-mono text-slate-300">{s.fecha}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{tienda?.nombre}</td>
                    <td className="py-3.5 px-4 text-slate-300">{prod?.nombre}</td>
                    <td className="py-3.5 px-4 font-bold text-amber-400">+{s.cantidadSugerida} un.</td>
                    <td className="py-3.5 px-4 text-slate-400 italic">{s.notas || 'Sin notas'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
