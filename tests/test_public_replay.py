import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'replay/v2d1_opt_b_public.json').read_text(encoding='utf8'))

class ReplayContract(unittest.TestCase):
    def test_fleet(self):
        self.assertEqual(DATA['fleet_size'], 1574)
        self.assertEqual(len(DATA['initial_positions_lat_lon']), 1574)
        self.assertEqual(DATA['mode'], 'REPLAY_ONLY')
    def test_real_gpt_options(self):
        self.assertEqual(DATA['gpt_decision']['status'], 'ANOMALY_DETECTED')
        self.assertEqual({o['id'] for o in DATA['gpt_decision']['options']}, {'OPT_A','OPT_B','OPT_C'})
        self.assertEqual(DATA['computed_comparison_option'],'OPT_B')
    def test_event_ranges_and_ids(self):
        for key in ['events_baseline','events_selected_opt_b']:
            self.assertGreater(len(DATA[key]), 0)
            for e in DATA[key]:
                self.assertEqual(len(e), 8)
                vid,start,end,la1,lo1,la2,lo2,state=e
                self.assertTrue(0<=vid<1574)
                self.assertTrue(19<=start<=end<=34)
                self.assertTrue(37<=la1<=39 and 37<=la2<=39)
                self.assertTrue(125<=lo1<=128 and 125<=lo2<=128)
    def test_no_private_fields(self):
        raw=(ROOT/'replay/v2d1_opt_b_public.json').read_text(encoding='utf8')
        for forbidden in ['DEVELOPER_ONLY','SHOCK_EXTRA_CALLS','OPENAI_API_KEY','rng_state','pending_requests','future_requests','api_response_id']:
            self.assertNotIn(forbidden,raw)
    def test_true_metrics(self):
        by={r['branch']:r for r in DATA['metrics']}
        self.assertEqual(by['NO_ACTION']['picked_up'],76)
        self.assertEqual(by['SELECTED_ACTION']['picked_up'],80)
        self.assertEqual(by['NO_ACTION']['completed'],12)
        self.assertEqual(by['SELECTED_ACTION']['completed'],14)
    def test_relocated_vehicle_ids(self):
        self.assertEqual(DATA['actual_rebalancing_vehicle_ids'],[310,696,280,130,748,896])

if __name__=='__main__':unittest.main()
