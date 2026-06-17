/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Dropdown, Form, Header, Icon, Label } from 'semantic-ui-react';
import { usePopup } from '../../../lib/popup';
import { Input } from '../../../lib/custom-ui';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useClosableModal, useForm, useNestedRef } from '../../../hooks';
import { isModifierKeyPressed } from '../../../utils/event-helpers';
import { ProjectTypes } from '../../../constants/Enums';
import { ProjectTypeIcons } from '../../../constants/Icons';
import SelectTypeStep from './SelectTypeStep';

import styles from './AddProjectModal.module.scss';

/* ── Catálogo de servicios Saggio ── */
const SERVICE_OPTIONS = [
  // ── Huella de Carbono
  { key: 'ghg_inventory', value: 'Inventario GEI (Alcances 1, 2 y 3)',       text: 'Inventario GEI (Alcances 1, 2 y 3)',       category: '🌡️ Huella de Carbono' },
  { key: 'carbon_product', value: 'Huella de Carbono de Producto',            text: 'Huella de Carbono de Producto',            category: '🌡️ Huella de Carbono' },
  { key: 'carbon_reduce',  value: 'Plan de Reducción de Emisiones',           text: 'Plan de Reducción de Emisiones',           category: '🌡️ Huella de Carbono' },
  { key: 'carbon_neutral', value: 'Compensación y Neutralidad Climática',     text: 'Compensación y Neutralidad Climática',     category: '🌡️ Huella de Carbono' },
  { key: 'iso14064',       value: 'Verificación / Certificación ISO 14064',   text: 'Verificación / Certificación ISO 14064',   category: '🌡️ Huella de Carbono' },
  // ── Huella Hídrica
  { key: 'water_corp',     value: 'Huella Hídrica Corporativa',               text: 'Huella Hídrica Corporativa',               category: '💧 Huella Hídrica' },
  { key: 'water_product',  value: 'Huella Hídrica de Producto',               text: 'Huella Hídrica de Producto',               category: '💧 Huella Hídrica' },
  { key: 'water_plan',     value: 'Plan de Gestión del Agua',                 text: 'Plan de Gestión del Agua',                 category: '💧 Huella Hídrica' },
  { key: 'iso14046',       value: 'Certificación ISO 14046 / WFN',            text: 'Certificación ISO 14046 / WFN',            category: '💧 Huella Hídrica' },
  // ── ESG y Sostenibilidad
  { key: 'esg_strategy',   value: 'Estrategia ESG',                           text: 'Estrategia ESG',                           category: '🌿 ESG y Sostenibilidad' },
  { key: 'gri_report',     value: 'Reporte de Sostenibilidad (GRI)',          text: 'Reporte de Sostenibilidad (GRI)',          category: '🌿 ESG y Sostenibilidad' },
  { key: 'lca',            value: 'Análisis de Ciclo de Vida (ACV / LCA)',    text: 'Análisis de Ciclo de Vida (ACV / LCA)',    category: '🌿 ESG y Sostenibilidad' },
  { key: 'env_diag',       value: 'Diagnóstico Ambiental',                   text: 'Diagnóstico Ambiental',                   category: '🌿 ESG y Sostenibilidad' },
  { key: 'sdg_mapping',    value: 'Mapeo y Alineación con ODS',               text: 'Mapeo y Alineación con ODS',               category: '🌿 ESG y Sostenibilidad' },
  // ── Consultoría y Capacitación
  { key: 'climate_plan',   value: 'Plan de Acción Climática',                 text: 'Plan de Acción Climática',                 category: '📋 Consultoría y Capacitación' },
  { key: 'training',       value: 'Formación y Capacitación en Sostenibilidad', text: 'Formación y Capacitación en Sostenibilidad', category: '📋 Consultoría y Capacitación' },
  { key: 'regulatory',     value: 'Asesoría Regulatoria Ambiental',           text: 'Asesoría Regulatoria Ambiental',           category: '📋 Consultoría y Capacitación' },
  { key: 'supply_chain',   value: 'Sostenibilidad en Cadena de Suministro',   text: 'Sostenibilidad en Cadena de Suministro',   category: '📋 Consultoría y Capacitación' },
];

const SERVICE_OPTIONS_UI = SERVICE_OPTIONS.map((o) => ({
  ...o,
  content: (
    <div>
      <span style={{ fontSize: 11, color: '#888', display: 'block' }}>{o.category}</span>
      {o.text}
    </div>
  ),
}));

/* Normas / estándares de referencia */
const STANDARD_OPTIONS = [
  { key: 'ghg',    value: 'GHG Protocol',                    text: 'GHG Protocol' },
  { key: '14064',  value: 'ISO 14064',                       text: 'ISO 14064' },
  { key: '14046',  value: 'ISO 14046',                       text: 'ISO 14046' },
  { key: 'wfn',    value: 'Water Footprint Network (WFN)',   text: 'Water Footprint Network (WFN)' },
  { key: 'gri',    value: 'GRI Standards',                   text: 'GRI Standards' },
  { key: 'tcfd',   value: 'TCFD',                            text: 'TCFD' },
  { key: 'cdp',    value: 'CDP',                             text: 'CDP' },
  { key: 'sbti',   value: 'Science Based Targets (SBTi)',    text: 'Science Based Targets (SBTi)' },
  { key: 'iso14001', value: 'ISO 14001',                     text: 'ISO 14001' },
  { key: 'lca14040', value: 'ISO 14040 / 14044 (ACV)',       text: 'ISO 14040 / 14044 (ACV)' },
  { key: 'otros',  value: 'Otros / Interno',                 text: 'Otros / Interno' },
];

const PROJECT_STATUS_OPTIONS = [
  { key: 'on_track',  value: 'on_track',  text: '🟢 En curso' },
  { key: 'at_risk',   value: 'at_risk',   text: '🟡 En riesgo' },
  { key: 'on_hold',   value: 'on_hold',   text: '🔴 Detenido' },
  { key: 'completed', value: 'completed', text: '✅ Completado' },
];

const PROJECT_TEMPLATES = [
  {
    key: 'ghg',
    icon: '🌡️',
    title: 'Inventario GEI',
    subtitle: 'GHG Protocol · Alcances 1, 2 y 3',
    description: 'Cuantificación completa de emisiones corporativas conforme al GHG Protocol Corporate Standard.',
    duration: '3–5 meses',
    fields: {
      serviceType: 'Inventario GEI (Alcances 1, 2 y 3)',
      serviceDescription: 'Inventario de gases de efecto invernadero conforme al GHG Protocol Corporate Standard, incluyendo alcances 1, 2 y 3 relevantes para la organización.',
      scope: 'Emisiones directas (Alcance 1), emisiones indirectas de energía (Alcance 2) y otras emisiones indirectas de cadena de valor (Alcance 3) seleccionadas según materialidad.',
      objectives: 'Cuantificar y reportar el inventario de GEI de la organización. Identificar las principales fuentes de emisión. Establecer la línea base para futuros planes de reducción.',
    },
  },
  {
    key: 'water',
    icon: '💧',
    title: 'Huella Hídrica',
    subtitle: 'ISO 14046 · WFN',
    description: 'Evaluación del consumo y contaminación de agua en operaciones propias y cadena de suministro.',
    duration: '2–4 meses',
    fields: {
      serviceType: 'Huella Hídrica Corporativa',
      serviceDescription: 'Evaluación de la huella hídrica corporativa (azul, verde y gris) conforme a ISO 14046 y la metodología Water Footprint Network.',
      scope: 'Consumo de agua en operaciones propias: agua azul (superficial y subterránea), agua verde (precipitación) y agua gris (contaminación). Se incluyen procesos directos e indirectos con mayor impacto.',
      objectives: 'Cuantificar el volumen total de agua consumida y contaminada. Identificar los puntos críticos de consumo hídrico. Proponer medidas de gestión y eficiencia del recurso hídrico.',
    },
  },
  {
    key: 'reduction',
    icon: '📉',
    title: 'Plan de Reducción',
    subtitle: 'GHG Protocol · SBTi',
    description: 'Diseño de hoja de ruta para reducir emisiones con metas alineadas a la ciencia (SBTi).',
    duration: '2–3 meses',
    fields: {
      serviceType: 'Plan de Reducción de Emisiones',
      serviceDescription: 'Diseño de plan de reducción de emisiones GEI con metas a corto y largo plazo, alineadas a la ciencia según metodología Science Based Targets initiative (SBTi).',
      scope: 'Análisis de línea base de emisiones (requiere inventario GEI previo). Identificación de opciones de reducción por alcance. Evaluación de costo-efectividad. Definición de metas y cronograma de implementación.',
      objectives: 'Definir metas de reducción de emisiones alineadas a 1.5°C. Identificar y priorizar acciones de reducción viables. Diseñar hoja de ruta con responsables, plazos e inversiones estimadas.',
    },
  },
  {
    key: 'gri',
    icon: '📋',
    title: 'Reporte GRI',
    subtitle: 'GRI Standards · ESG',
    description: 'Elaboración del reporte de sostenibilidad bajo estándares GRI con análisis de materialidad.',
    duration: '3–6 meses',
    fields: {
      serviceType: 'Reporte de Sostenibilidad (GRI)',
      serviceDescription: 'Elaboración del reporte de sostenibilidad corporativa conforme a los GRI Standards (opción conforme). Incluye análisis de materialidad, recopilación de indicadores y redacción del informe.',
      scope: 'Análisis de materialidad con grupos de interés. Recopilación de indicadores ambientales, sociales y de gobernanza (ASG/ESG). Verificación de datos y elaboración del reporte público.',
      objectives: 'Comunicar el desempeño de sostenibilidad a grupos de interés. Cumplir con estándares GRI reconocidos internacionalmente. Identificar áreas de mejora en gestión ambiental y social.',
    },
  },
  {
    key: 'lca',
    icon: '♻️',
    title: 'ACV / LCA',
    subtitle: 'ISO 14040 · ISO 14044',
    description: 'Análisis de Ciclo de Vida de producto o proceso para cuantificar impactos ambientales totales.',
    duration: '3–5 meses',
    fields: {
      serviceType: 'Análisis de Ciclo de Vida (ACV / LCA)',
      serviceDescription: 'Análisis de Ciclo de Vida (ACV) conforme a ISO 14040 e ISO 14044. Evaluación de impactos ambientales desde extracción de materias primas hasta fin de vida del producto.',
      scope: 'Unidad funcional definida con el cliente. Límites del sistema: cuna a puerta, cuna a tumba o cuna a cuna según el objetivo. Categorías de impacto: cambio climático, agotamiento hídrico, eutrofización, entre otras.',
      objectives: 'Cuantificar los impactos ambientales del ciclo de vida del producto/proceso. Identificar los puntos de mejora ambiental. Apoyar decisiones de ecodiseño y comunicación ambiental.',
    },
  },
  {
    key: 'esg',
    icon: '🌿',
    title: 'Estrategia ESG',
    subtitle: 'GRI · TCFD · CDP',
    description: 'Diseño de la estrategia integral de sostenibilidad empresarial y hoja de ruta ESG.',
    duration: '2–4 meses',
    fields: {
      serviceType: 'Estrategia ESG',
      serviceDescription: 'Diseño de estrategia ESG (Ambiental, Social y Gobernanza) con diagnóstico de madurez, definición de pilares estratégicos y hoja de ruta de implementación.',
      scope: 'Diagnóstico de desempeño ESG actual. Análisis de expectativas de grupos de interés. Definición de compromisos y KPIs. Alineación con marcos TCFD, CDP, GRI y ODS.',
      objectives: 'Diseñar una estrategia ESG coherente con el negocio. Establecer metas medibles de sostenibilidad. Preparar a la organización para reportes y evaluaciones ESG de inversores.',
    },
  },
];

const AddProjectModal = React.memo(() => {
  const defaultType = useSelector(
    (state) => selectors.selectCurrentModal(state).params.defaultType,
  );

  const { data: defaultData, isSubmitting } = useSelector(selectors.selectProjectCreateForm);
  const currentUser = useSelector(selectors.selectCurrentUser);
  const allUsers = useSelector(selectors.selectUsers);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const [data, handleFieldChange, setData] = useForm(() => ({
    name: '',
    type: ProjectTypes.PRIVATE,
    clientName: '',
    serviceType: '',
    serviceStandard: '',
    serviceDescription: '',
    scope: '',
    objectives: '',
    projectStatus: 'on_track',
    startDate: '',
    endDate: '',
    memberUserIds: [],
    ...defaultData,
    ...(defaultType && { type: defaultType }),
  }));

  const [nameFieldRef, handleNameFieldRef] = useNestedRef('inputRef');

  const submit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
      clientName: data.clientName.trim() || null,
      serviceType: data.serviceType || null,
      serviceDescription: [
        data.serviceStandard ? `Norma/Estándar: ${data.serviceStandard}` : '',
        data.serviceDescription.trim(),
      ].filter(Boolean).join('\n') || null,
      scope: data.scope.trim() || null,
      objectives: data.objectives.trim() || null,
      description: null,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
      endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
    };

    if (!cleanData.name) {
      nameFieldRef.current.select();
      return;
    }

    dispatch(entryActions.createProject(cleanData));
  }, [dispatch, data, nameFieldRef]);

  const handleClose = useCallback(() => {
    dispatch(entryActions.closeModal());
  }, [dispatch]);

  const handleSubmit = useCallback(() => { submit(); }, [submit]);

  const handleKeyDown = useCallback(
    (event) => {
      if (isModifierKeyPressed(event) && event.key === 'Enter') submit();
    },
    [submit],
  );

  const handleServiceTypeChange = useCallback(
    (_e, { value }) => setData((prev) => ({ ...prev, serviceType: value })),
    [setData],
  );

  const handleStandardChange = useCallback(
    (_e, { value }) => setData((prev) => ({ ...prev, serviceStandard: value })),
    [setData],
  );

  const handleStatusChange = useCallback(
    (_e, { value }) => setData((prev) => ({ ...prev, projectStatus: value })),
    [setData],
  );

  const userOptions = useMemo(
    () =>
      allUsers
        .filter((u) => u.id !== currentUser.id)
        .map((u) => ({
          key: u.id,
          value: u.id,
          text: u.name || u.username,
          description: u.email,
        })),
    [allUsers, currentUser.id],
  );

  const handleMembersChange = useCallback(
    (_e, { value }) => setData((prev) => ({ ...prev, memberUserIds: value })),
    [setData],
  );

  const handleTypeSelect = useCallback(
    (type) => setData((prev) => ({ ...prev, type })),
    [setData],
  );

  const [showTemplates, setShowTemplates] = useState(true);

  const handleTemplateSelect = useCallback((template) => {
    setData((prev) => ({
      ...prev,
      serviceType: template.fields.serviceType,
      serviceDescription: template.fields.serviceDescription,
      scope: template.fields.scope,
      objectives: template.fields.objectives,
    }));
    setShowTemplates(false);
  }, [setData]);

  const [ClosableModal, , activateClosable, deactivateClosable] = useClosableModal();

  const handleSelectTypeClose = useCallback(() => {
    deactivateClosable();
    nameFieldRef.current.focus();
  }, [deactivateClosable, nameFieldRef]);

  useEffect(() => { nameFieldRef.current.focus(); }, [nameFieldRef]);

  const SelectTypePopup = usePopup(SelectTypeStep, {
    onOpen: activateClosable,
    onClose: handleSelectTypeClose,
  });

  /* Placeholder dinámico según servicio seleccionado */
  const scopePlaceholder = useMemo(() => {
    if (!data.serviceType) return '¿Qué incluye y qué no incluye este proyecto?';
    if (data.serviceType.includes('Huella Hídrica')) return 'Ej: Medición de agua azul, verde y gris en la cadena productiva de la empresa. Excluye operaciones fuera del territorio nacional.';
    if (data.serviceType.includes('GEI') || data.serviceType.includes('Carbono')) return 'Ej: Cuantificación de emisiones directas (Alcance 1) e indirectas (Alcance 2) de todas las instalaciones del cliente. Excluye Alcance 3.';
    if (data.serviceType.includes('ESG') || data.serviceType.includes('GRI')) return 'Ej: Elaboración del reporte de sostenibilidad bajo estándar GRI 2021, incluyendo materialidad y grupos de interés.';
    return '¿Qué incluye y qué no incluye este proyecto?';
  }, [data.serviceType]);

  const objectivesPlaceholder = useMemo(() => {
    if (!data.serviceType) return '¿Cuáles son los objetivos principales del proyecto?';
    if (data.serviceType.includes('Huella Hídrica')) return 'Ej: Cuantificar la huella hídrica corporativa, identificar puntos críticos de consumo y formular un plan de eficiencia hídrica.';
    if (data.serviceType.includes('GEI') || data.serviceType.includes('Carbono')) return 'Ej: Conocer el nivel de emisiones de GEI, establecer línea base y definir metas de reducción alineadas al Acuerdo de París.';
    if (data.serviceType.includes('Reducción')) return 'Ej: Identificar medidas de abatimiento, calcular potencial de reducción y ROI ambiental por medida.';
    return '¿Cuáles son los objetivos principales del proyecto?';
  }, [data.serviceType]);

  return (
    <ClosableModal basic closeIcon size="small" onClose={handleClose}>
      <ClosableModal.Content>
        <Header inverted size="huge">
          {t('common.createProject', { context: 'title' })}
        </Header>
        {showTemplates ? (
          <div className={styles.templatesStep}>
            <div className={styles.templatesHeader}>
              <div className={styles.templatesTitle}>¿Con qué servicio empezamos?</div>
              <div className={styles.templatesSubtitle}>Elige una plantilla para pre-completar el formulario, o empieza en blanco.</div>
            </div>
            <div className={styles.templatesGrid}>
              {PROJECT_TEMPLATES.map((tpl) => (
                <button key={tpl.key} type="button" className={styles.templateCard} onClick={() => handleTemplateSelect(tpl)}>
                  <div className={styles.templateIcon}>{tpl.icon}</div>
                  <div className={styles.templateTitle}>{tpl.title}</div>
                  <div className={styles.templateSubtitle}>{tpl.subtitle}</div>
                  <div className={styles.templateDesc}>{tpl.description}</div>
                  <div className={styles.templateDuration}>⏱ {tpl.duration}</div>
                </button>
              ))}
              <button type="button" className={styles.templateCardBlank} onClick={() => setShowTemplates(false)}>
                <div className={styles.templateIcon}>📄</div>
                <div className={styles.templateTitle}>En blanco</div>
                <div className={styles.templateDesc}>Empieza con el formulario vacío y personaliza todo desde cero.</div>
              </button>
            </div>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>

            {/* Nombre del proyecto */}
            <div className={styles.text}>Nombre del proyecto *</div>
            <Input
              fluid
              inverted
              ref={handleNameFieldRef}
              name="name"
              value={data.name}
              maxLength={128}
              placeholder="Ej: Inventario GEI 2024 — Empresa XYZ"
              readOnly={isSubmitting}
              className={styles.field}
              onChange={handleFieldChange}
            />

            {/* Cliente */}
            <div className={styles.text}>Cliente</div>
            <Input
              fluid
              inverted
              name="clientName"
              value={data.clientName}
              maxLength={256}
              placeholder="Nombre de la empresa o persona"
              readOnly={isSubmitting}
              className={styles.field}
              onChange={handleFieldChange}
            />

            {/* Tipo de servicio */}
            <div className={styles.text}>Tipo de servicio</div>
            <Dropdown
              fluid
              search
              selection
              clearable
              options={SERVICE_OPTIONS_UI}
              value={data.serviceType}
              placeholder="Seleccionar servicio..."
              className={styles.field}
              onChange={handleServiceTypeChange}
            />

            {/* Norma / Estándar */}
            <div className={styles.text}>Norma / Estándar de referencia</div>
            <Dropdown
              fluid
              search
              selection
              clearable
              options={STANDARD_OPTIONS}
              value={data.serviceStandard}
              placeholder="GHG Protocol, ISO 14064, GRI..."
              className={styles.field}
              onChange={handleStandardChange}
            />

            {/* Descripción del servicio */}
            <div className={styles.text}>Descripción del servicio</div>
            <TextareaAutosize
              name="serviceDescription"
              value={data.serviceDescription}
              maxLength={2048}
              minRows={2}
              placeholder="Describe brevemente el trabajo a realizar, metodología o entregables esperados..."
              className={styles.textarea}
              onKeyDown={handleKeyDown}
              onChange={handleFieldChange}
            />

            {/* Alcance */}
            <div className={styles.text}>Alcance</div>
            <TextareaAutosize
              name="scope"
              value={data.scope}
              maxLength={4096}
              minRows={2}
              placeholder={scopePlaceholder}
              className={styles.textarea}
              onKeyDown={handleKeyDown}
              onChange={handleFieldChange}
            />

            {/* Objetivos */}
            <div className={styles.text}>Objetivos del proyecto</div>
            <TextareaAutosize
              name="objectives"
              value={data.objectives}
              maxLength={4096}
              minRows={2}
              placeholder={objectivesPlaceholder}
              className={styles.textarea}
              onKeyDown={handleKeyDown}
              onChange={handleFieldChange}
            />

            {/* Estado */}
            <div className={styles.text}>Estado del proyecto</div>
            <Dropdown
              fluid
              selection
              options={PROJECT_STATUS_OPTIONS}
              value={data.projectStatus}
              className={styles.field}
              onChange={handleStatusChange}
            />

            {/* Fechas */}
            <div className={styles.dateRow}>
              <div className={styles.dateField}>
                <div className={styles.text}>Fecha de inicio</div>
                <input
                  type="date"
                  name="startDate"
                  value={data.startDate}
                  className={styles.dateInput}
                  onChange={handleFieldChange}
                />
              </div>
              <div className={styles.dateField}>
                <div className={styles.text}>Fecha de entrega</div>
                <input
                  type="date"
                  name="endDate"
                  value={data.endDate}
                  className={styles.dateInput}
                  onChange={handleFieldChange}
                />
              </div>
            </div>

            {/* Equipo asignado */}
            {userOptions.length > 0 && (
              <>
                <div className={styles.text}>Equipo asignado</div>
                <Dropdown
                  fluid
                  multiple
                  search
                  selection
                  options={userOptions}
                  value={data.memberUserIds}
                  placeholder="Seleccionar consultores del equipo..."
                  className={styles.field}
                  renderLabel={(item) => <Label content={item.text} />}
                  onChange={handleMembersChange}
                />
              </>
            )}

            <div className={styles.actions}>
              <Button
                inverted
                color="green"
                icon="checkmark"
                content={t('action.createProject')}
                loading={isSubmitting}
                disabled={isSubmitting}
              />
              <SelectTypePopup value={data.type} onSelect={handleTypeSelect}>
                <Button type="button" className={styles.selectTypeButton}>
                  <Icon name={ProjectTypeIcons[data.type]} className={styles.selectTypeButtonIcon} />
                  {t(`common.${data.type}`)}
                </Button>
              </SelectTypePopup>
            </div>
          </Form>
        )}
      </ClosableModal.Content>
    </ClosableModal>
  );
});

export default AddProjectModal;
