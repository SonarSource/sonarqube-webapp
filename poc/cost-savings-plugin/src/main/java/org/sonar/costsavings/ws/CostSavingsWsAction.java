package org.sonar.costsavings.ws;

import org.sonar.api.server.ws.WebService;

/**
 * Marker interface for all cost-savings WS actions.
 */
public interface CostSavingsWsAction {
  void define(WebService.NewController controller);
}
