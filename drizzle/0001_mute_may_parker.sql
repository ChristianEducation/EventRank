CREATE INDEX "actividades_tenant_id_idx" ON "actividades" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "actividades_evento_id_idx" ON "actividades" USING btree ("evento_id");--> statement-breakpoint
CREATE INDEX "actividades_escala_id_idx" ON "actividades" USING btree ("escala_id");--> statement-breakpoint
CREATE INDEX "escalas_puntaje_tenant_id_idx" ON "escalas_puntaje" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "escalas_puntaje_evento_id_idx" ON "escalas_puntaje" USING btree ("evento_id");--> statement-breakpoint
CREATE INDEX "eventos_tenant_id_idx" ON "eventos" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "grupos_tenant_id_idx" ON "grupos" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "grupos_evento_id_idx" ON "grupos" USING btree ("evento_id");--> statement-breakpoint
CREATE INDEX "horarios_tenant_id_idx" ON "horarios" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "horarios_evento_id_idx" ON "horarios" USING btree ("evento_id");--> statement-breakpoint
CREATE INDEX "pagos_tenant_id_idx" ON "pagos" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "pagos_evento_id_idx" ON "pagos" USING btree ("evento_id");--> statement-breakpoint
CREATE INDEX "puntajes_tenant_id_idx" ON "puntajes" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "puntajes_evento_id_idx" ON "puntajes" USING btree ("evento_id");--> statement-breakpoint
CREATE INDEX "puntajes_actividad_id_idx" ON "puntajes" USING btree ("actividad_id");--> statement-breakpoint
CREATE INDEX "puntajes_grupo_id_idx" ON "puntajes" USING btree ("grupo_id");--> statement-breakpoint
CREATE INDEX "reglas_generales_tenant_id_idx" ON "reglas_generales" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "reglas_generales_evento_id_idx" ON "reglas_generales" USING btree ("evento_id");