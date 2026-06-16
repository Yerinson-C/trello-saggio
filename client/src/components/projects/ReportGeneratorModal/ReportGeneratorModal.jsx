/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import selectors from '../../../selectors';

import styles from './ReportGeneratorModal.module.scss';

/* ─────────────────── constants ─────────────────── */

const REPORT_TYPES = [
  { id: 'ghg',       label: 'Inventario GEI (GHG Protocol)' },
  { id: 'water',     label: 'Huella Hídrica (ISO 14046)' },
  { id: 'gri',       label: 'Sostenibilidad Corporativa (GRI)' },
  { id: 'executive', label: 'Resumen Ejecutivo' },
];

const REPORT_TITLES = {
  ghg:       'INFORME DE INVENTARIO GEI',
  water:     'INFORME DE HUELLA HÍDRICA',
  gri:       'INFORME DE SOSTENIBILIDAD CORPORATIVA',
  executive: 'RESUMEN EJECUTIVO',
};

const SECTIONS_DEFAULT = {
  resumenEjecutivo:        true,
  metodologiaAplicada:     true,
  inventarioEmisiones:     true,
  resultadosPorAlcance:    true,
  comparacionAnioAnterior: true,
  planReduccion:           true,
  conclusiones:            true,
  anexosTecnicos:          true,
};

const SECTION_LABELS = {
  resumenEjecutivo:        'Resumen ejecutivo',
  metodologiaAplicada:     'Metodología aplicada',
  inventarioEmisiones:     'Inventario de emisiones / consumo hídrico',
  resultadosPorAlcance:    'Resultados por alcance/categoría',
  comparacionAnioAnterior: 'Comparación con año anterior',
  planReduccion:           'Plan de reducción y metas',
  conclusiones:            'Conclusiones y recomendaciones',
  anexosTecnicos:          'Anexos técnicos',
};

function todayString() {
  return new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/* ─────────────────── ReportGeneratorModal ─────────────────── */

const ReportGeneratorModal = React.memo(({ onClose }) => {
  const project     = useSelector(selectors.selectCurrentProject);
  const currentUser = useSelector(selectors.selectCurrentUser); // eslint-disable-line no-unused-vars

  const [selectedType, setSelectedType] = useState('ghg');
  const [sections,     setSections]     = useState(SECTIONS_DEFAULT);
  const [notes,        setNotes]        = useState('');
  const [fromDate,     setFromDate]     = useState('2025-01-01');
  const [toDate,       setToDate]       = useState('2025-12-31');

  const handleSectionToggle = (key) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const previewTitle = REPORT_TITLES[selectedType] || 'INFORME';

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.headerTitle}>Generar Informe de Proyecto</span>
          <button className={styles.closeBtn} onClick={onClose} title="Cerrar">
            &#x2715;
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>

          {/* LEFT PANEL */}
          <div className={styles.leftPanel}>

            {/* Tipo de Informe */}
            <div className={styles.sectionLabel}>Tipo de Informe</div>
            {REPORT_TYPES.map((type) => (
              <div
                key={type.id}
                className={
                  styles.typeOption +
                  (selectedType === type.id ? ' ' + styles.typeOptionSelected : '')
                }
                onClick={() => setSelectedType(type.id)}
                role="radio"
                aria-checked={selectedType === type.id}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedType(type.id)}
              >
                <span style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  border: '2px solid ' + (selectedType === type.id ? '#0079bf' : '#aaa'),
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {selectedType === type.id && (
                    <span style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#0079bf',
                      display: 'block',
                    }} />
                  )}
                </span>
                {type.label}
              </div>
            ))}

            {/* Periodo */}
            <div className={styles.sectionLabel}>Período</div>
            <div className={styles.dateRow}>
              <div>
                <div style={{ fontSize: 11, color: '#6b808c', marginBottom: 4 }}>Desde</div>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#6b808c', marginBottom: 4 }}>Hasta</div>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>

            {/* Secciones */}
            <div className={styles.sectionLabel}>Secciones a incluir</div>
            {Object.keys(SECTIONS_DEFAULT).map((key) => (
              <label key={key} className={styles.checkItem}>
                <input
                  type="checkbox"
                  checked={sections[key]}
                  onChange={() => handleSectionToggle(key)}
                />
                {SECTION_LABELS[key]}
              </label>
            ))}

            {/* Logo */}
            <div className={styles.sectionLabel}>Logo del cliente</div>
            <div className={styles.logoBox}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>&#8593;</div>
              Arrastra el logo aquí o haz click
            </div>

            {/* Notas */}
            <div className={styles.sectionLabel}>Notas adicionales</div>
            <textarea
              className={styles.notesTextarea}
              placeholder="Observaciones para el informe..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* RIGHT PANEL */}
          <div className={styles.rightPanel}>
            <div className={styles.sectionLabel} style={{ marginTop: 0 }}>Vista Previa del Informe</div>

            <div className={styles.previewDoc}>
              <div className={styles.previewConfidential}>
                CONFIDENCIAL — SAGGIO ESG CONSULTORES
              </div>

              <div className={styles.previewTitle}>{previewTitle}</div>

              <div className={styles.previewSubtitle}>
                {(project && project.name) ? project.name : 'Proyecto'}
              </div>

              <hr className={styles.previewRule} />

              <div className={styles.previewMeta}>
                <strong>Período de reporte:</strong> Enero 2025 — Diciembre 2025
              </div>
              <div className={styles.previewMeta}>
                <strong>Cliente:</strong> {(project && project.clientName) ? project.clientName : '—'}
              </div>
              <div className={styles.previewMeta}>
                <strong>Preparado por:</strong> Saggio ESG Consultores
              </div>
              <div className={styles.previewMeta}>
                <strong>Fecha de emisión:</strong> {todayString()}
              </div>

              <hr className={styles.previewRule} />

              {sections.resumenEjecutivo && (
                <>
                  <div className={styles.previewSectionTitle}>1. RESUMEN EJECUTIVO</div>
                  <p className={styles.previewText}>
                    Este informe presenta los resultados del inventario de gases de efecto
                    invernadero (GEI) correspondiente al período enero–diciembre 2025, elaborado
                    conforme al GHG Protocol Corporate Standard. Se identificaron y cuantificaron
                    las emisiones directas e indirectas asociadas a las operaciones de la
                    organización, con el objetivo de establecer una línea base para la gestión
                    climática corporativa.
                  </p>
                </>
              )}

              {sections.metodologiaAplicada && (
                <>
                  <div className={styles.previewSectionTitle}>2. METODOLOGÍA</div>
                  <p className={styles.previewText}>
                    La metodología aplicada sigue los principios del GHG Protocol: relevancia,
                    exhaustividad, consistencia, transparencia y precisión. Los factores de
                    emisión utilizados corresponden a las bases de datos IPCC AR6 y DEFRA 2024.
                  </p>
                </>
              )}

              {sections.resultadosPorAlcance && (
                <>
                  <div className={styles.previewSectionTitle}>3. RESULTADOS PRINCIPALES</div>
                  <table className={styles.previewTable}>
                    <thead>
                      <tr>
                        <th>Alcance</th>
                        <th>Categoría</th>
                        <th>Emisiones (tCO&#x2082;e)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Alcance 1</td>
                        <td>Emisiones directas</td>
                        <td>45.2 tCO&#x2082;e</td>
                      </tr>
                      <tr>
                        <td>Alcance 2</td>
                        <td>Electricidad indirecta</td>
                        <td>38.1 tCO&#x2082;e</td>
                      </tr>
                      <tr>
                        <td>Alcance 3</td>
                        <td>Otras emisiones indirectas</td>
                        <td>59.2 tCO&#x2082;e</td>
                      </tr>
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancelar
          </button>
          <button
            className={styles.downloadBtn}
            disabled
            title="Próximamente"
          >
            &#8595; Descargar PDF
          </button>
          <button
            className={styles.sendBtn}
            disabled
            title="Próximamente"
          >
            Enviar al cliente
          </button>
        </div>
      </div>
    </div>
  );
});

export default ReportGeneratorModal;
