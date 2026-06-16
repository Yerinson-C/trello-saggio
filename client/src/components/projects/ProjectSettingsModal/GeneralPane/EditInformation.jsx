/*!
 * Copyright (c) 2024 TRELLO SAGGIO Software GmbH
 * Licensed under the Fair Use License: https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md
 */

import { dequal } from 'dequal';
import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Dropdown, Form, Input, TextArea } from 'semantic-ui-react';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import { useForm, useNestedRef } from '../../../../hooks';
import { isModifierKeyPressed } from '../../../../utils/event-helpers';

import styles from './EditInformation.module.scss';

const SERVICE_OPTIONS = [
  { key: 'ghg_inventory', value: 'Inventario GEI (Alcances 1, 2 y 3)',         text: 'Inventario GEI (Alcances 1, 2 y 3)' },
  { key: 'carbon_product', value: 'Huella de Carbono de Producto',              text: 'Huella de Carbono de Producto' },
  { key: 'carbon_reduce',  value: 'Plan de Reducción de Emisiones',             text: 'Plan de Reducción de Emisiones' },
  { key: 'carbon_neutral', value: 'Compensación y Neutralidad Climática',       text: 'Compensación y Neutralidad Climática' },
  { key: 'iso14064',       value: 'Verificación / Certificación ISO 14064',     text: 'Verificación / Certificación ISO 14064' },
  { key: 'water_corp',     value: 'Huella Hídrica Corporativa',                 text: 'Huella Hídrica Corporativa' },
  { key: 'water_product',  value: 'Huella Hídrica de Producto',                 text: 'Huella Hídrica de Producto' },
  { key: 'water_plan',     value: 'Plan de Gestión del Agua',                   text: 'Plan de Gestión del Agua' },
  { key: 'iso14046',       value: 'Certificación ISO 14046 / WFN',              text: 'Certificación ISO 14046 / WFN' },
  { key: 'esg_strategy',   value: 'Estrategia ESG',                             text: 'Estrategia ESG' },
  { key: 'gri_report',     value: 'Reporte de Sostenibilidad (GRI)',            text: 'Reporte de Sostenibilidad (GRI)' },
  { key: 'lca',            value: 'Análisis de Ciclo de Vida (ACV / LCA)',      text: 'Análisis de Ciclo de Vida (ACV / LCA)' },
  { key: 'env_diag',       value: 'Diagnóstico Ambiental',                     text: 'Diagnóstico Ambiental' },
  { key: 'sdg_mapping',    value: 'Mapeo y Alineación con ODS',                 text: 'Mapeo y Alineación con ODS' },
  { key: 'climate_plan',   value: 'Plan de Acción Climática',                   text: 'Plan de Acción Climática' },
  { key: 'training',       value: 'Formación y Capacitación en Sostenibilidad', text: 'Formación y Capacitación en Sostenibilidad' },
  { key: 'regulatory',     value: 'Asesoría Regulatoria Ambiental',             text: 'Asesoría Regulatoria Ambiental' },
  { key: 'supply_chain',   value: 'Sostenibilidad en Cadena de Suministro',     text: 'Sostenibilidad en Cadena de Suministro' },
];


const EditInformation = React.memo(() => {
  const project = useSelector(selectors.selectCurrentProject);

  const dispatch = useDispatch();
  const [t] = useTranslation();

  const defaultData = useMemo(
    () => ({
      name: project.name,
      clientName: project.clientName || '',
      serviceType: project.serviceType || '',
      serviceDescription: project.serviceDescription || '',
      scope: project.scope || '',
      objectives: project.objectives || '',
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project.id],
  );

  const [data, handleFieldChange, setData] = useForm(() => ({
    ...defaultData,
  }));

  const cleanData = useMemo(
    () => ({
      ...data,
      name: data.name.trim(),
      clientName: data.clientName.trim() || null,
      serviceType: data.serviceType || null,
      serviceDescription: data.serviceDescription.trim() || null,
      scope: data.scope.trim() || null,
      objectives: data.objectives.trim() || null,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
      endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
    }),
    [data],
  );

  const [nameFieldRef, handleNameFieldRef] = useNestedRef('inputRef');

  const submit = useCallback(() => {
    if (!cleanData.name) {
      nameFieldRef.current.select();
      return;
    }
    dispatch(entryActions.updateCurrentProject(cleanData));
  }, [dispatch, cleanData, nameFieldRef]);

  const handleSubmit = useCallback(() => { submit(); }, [submit]);

  const handleKeyDown = useCallback(
    (event) => { if (isModifierKeyPressed(event) && event.key === 'Enter') submit(); },
    [submit],
  );

  const handleServiceTypeChange = useCallback(
    (_e, { value }) => setData((prev) => ({ ...prev, serviceType: value })),
    [setData],
  );

  return (
    <Form onSubmit={handleSubmit}>

      <div className={styles.text}>{t('common.title')} *</div>
      <Input
        fluid
        ref={handleNameFieldRef}
        name="name"
        value={data.name}
        maxLength={128}
        className={styles.field}
        onChange={handleFieldChange}
      />

      <div className={styles.text}>Cliente</div>
      <Input
        fluid
        name="clientName"
        value={data.clientName}
        maxLength={256}
        placeholder="Nombre del cliente"
        className={styles.field}
        onChange={handleFieldChange}
      />

      <div className={styles.text}>Tipo de servicio</div>
      <Dropdown
        fluid
        search
        selection
        clearable
        options={SERVICE_OPTIONS}
        value={data.serviceType}
        placeholder="Seleccionar servicio..."
        className={styles.field}
        onChange={handleServiceTypeChange}
      />

      <div className={styles.text}>Descripción del servicio</div>
      <TextArea
        as={TextareaAutosize}
        name="serviceDescription"
        value={data.serviceDescription}
        maxLength={2048}
        minRows={2}
        placeholder="Metodología, entregables, observaciones..."
        className={styles.field}
        onKeyDown={handleKeyDown}
        onChange={handleFieldChange}
      />

      <div className={styles.text}>Alcance</div>
      <TextArea
        as={TextareaAutosize}
        name="scope"
        value={data.scope}
        maxLength={4096}
        minRows={2}
        placeholder="¿Qué incluye y qué no incluye este proyecto?"
        className={styles.field}
        onKeyDown={handleKeyDown}
        onChange={handleFieldChange}
      />

      <div className={styles.text}>Objetivos del proyecto</div>
      <TextArea
        as={TextareaAutosize}
        name="objectives"
        value={data.objectives}
        maxLength={4096}
        minRows={2}
        placeholder="¿Cuáles son los objetivos principales?"
        className={styles.field}
        onKeyDown={handleKeyDown}
        onChange={handleFieldChange}
      />

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

      <Button positive disabled={dequal(cleanData, defaultData)} content={t('action.save')} />
    </Form>
  );
});

export default EditInformation;
