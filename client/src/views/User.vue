<template>
  <Container :slim="true">
    <UiLoading v-if="loading" class="overlay big" />
    <div v-else>
      <div class="px-4 px-md-0 mb-3">
        <router-link :to="{ name: 'home' }" class="text-gray">
          <Icon name="back" size="22" class="v-align-middle" />
          Home
        </router-link>
      </div>
      <div>
        <div class="col-12 col-lg-8 float-left pr-0 pr-lg-5">
          <div class="px-4 px-md-0">
            <h1 class="mb-3">{{ _shorten(address) }}</h1>
          </div>
          <!-- <a
            target="_blank"
            :href="_etherscanLink(txHash, 'tx')"
            v-if="txHash"
            class="p-4 bg-green text-white d-block rounded-0 rounded-md-2 mb-4 overflow-hidden"
          >
            <p class="mb-0">
              See transaction on Etherscan {{ _shorten(txHash) }}
              <Icon name="external-link" class="ml-1" />
            </p>
          </a> -->
          <Block :slim="true" title="Pending BAL">
            <div class="overflow-hidden">
              <div
                v-for="(item, index) in unclaimedArr"
                :key="index"
                class="px-4 py-3 border-top d-flex text-white"
                :style="index === 0 && 'border: 0 !important;'"
              >
                <div class="flex-auto">
                  <p style="font-size: 18px; margin-bottom: 0;">Week {{ Object.keys(item)[0] }}</p>
                  <!-- <a
                    :href="
                      `https://github.com/balancer-labs/bal-mining-scripts/blob/master/reports/${Object.keys(item)[0]}/_totals.json`
                    "
                    target="_blank"
                  >
                    Week {{ Object.keys(item)[0] }}
                    <Icon name="external-link" class="ml-1" />
                  </a> -->
                </div>
                <div>{{ item[Object.keys(item)[0]] }} BAL</div>
              </div>
              <p
                v-if="Object.keys(unclaimedArr).length === 0"
                class="p-4 m-0 d-block"
              >
                There isn't any pending BAL here.
              </p>
            </div>
          </Block>

          <!-- <div :key="index" v-for="(item, index) in unclaimedArr">
              <p>{{item.amount}}</p>
              <p>{{item.week_number}}</p>
          </div> -->

          <!-- <Block
            v-if="Object.keys(claimed).length > 0"
            :slim="true"
            title="Claimed BAL"
          >
            <div class="overflow-hidden">
              <div
                v-for="(dist, week, i) in claimed"
                :key="i"
                class="px-4 py-3 border-top d-flex text-white"
                :style="i === 0 && 'border: 0 !important;'"
              >
                <div class="flex-auto">
                  <a
                    :href="
                      `https://github.com/balancer-labs/bal-mining-scripts/blob/master/reports/${_week(
                        week
                      )}/_totals.json`
                    "
                    target="_blank"
                  >
                    Week {{ $n(_week(week)) }}
                    <Icon name="external-link" class="ml-1" />
                  </a>
                </div>
                <div>{{ $n(dist) }} BAL</div>
              </div>
            </div>
          </Block> -->
        </div>
        <div class="col-12 col-lg-4 float-left">
          <Block title="Total pending BAL">
            <div class="mb-2">
              <UiButton class="width-full mb-2">
                {{ total.toFixed(18) }} BAL
              </UiButton>
            </div>
            <UiButton
              @click="handleSubmit"
              :disabled="!web3.account || total === 0 || !localReports"
              :loading="submitLoading"
              class="d-block width-full button--submit"
            >
              Claim
            </UiButton>
          </Block>
        </div>
      </div>
    </div>
  </Container>
</template>

<script>
import { mapActions } from 'vuex';
import { getAddress } from '@ethersproject/address';

export default {
  data() {
    return {
      address: getAddress(this.$router.currentRoute.params.address),
      loading: false,
      loaded: false,
      submitLoading: false,
      txHash: false,
      unclaimedArr: [],
      total: 0,
      localReports: undefined
    };
  },
  computed: {
    unclaimed() {
      return Object.fromEntries(
        Object.entries(this.app.reports)
          .map(report => [report[0], report[1][this.address] || 0])
          .filter(
            report => this.unclaimedWeeks.includes(report[0]) && report[1] > 0
          )
      );
    },
    claimed() {
      return Object.fromEntries(
        Object.entries(this.app.reports)
          .map(report => [report[0], report[1][this.address] || 0])
          .filter(
            report => !this.unclaimedWeeks.includes(report[0]) && report[1] > 0
          )
      );
    },
    totalUnclaimed() {
      return Object.values(this.unclaimed).reduce(
        (a, b) => a + parseFloat(b),
        0
      );
    }
  },
  async created() {
    this.loading = true;
    // await this.getUnclaimedWeeks();
    // await this.loadReports(this.unclaimedWeeks);
    this.loading = false;
  },
  mounted() {
    // get unclaimed rewards for user
    this.getClaims();
    // get reports
    fetch(`${process.env.VUE_APP_IPFS_NODE}/get-reports`)
    .then(res => res.json())
    .then(data => {
      this.localReports = data;
    });
  },
  methods: {
    ...mapActions(['claimWeeks', 'claimStatus', 'loadReports']),
    async getClaims() {
      // const statuscina = await this.claimStatus(this.address);
      fetch(`${process.env.VUE_APP_IPFS_NODE}/get-unclaimed-rewards?address=${this.address}`)
      .then(res => res.json())
      .then(data => {
        this.unclaimedArr = data.data;
        let totalCounter = 0;
        data.data.length && data.data.forEach((item) => {
          totalCounter += parseFloat(item[Object.keys(item)[0]]);
        });
        this.total = totalCounter
      });
    },
    confirmClaims() {
      const confirmClaimData = {
        address: this.address,
        weeks: []
      }
      this.unclaimedArr.forEach((item, index) => {
        confirmClaimData.weeks.push({
          week: Object.keys(item)[0],
          amount: item[Object.keys(item)[0]]
        })
      });
      // window.location.reload();
      fetch(`${process.env.VUE_APP_IPFS_NODE}/confirm-claims`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        body: JSON.stringify(confirmClaimData)
      })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        if (data.success) {
          // this.unclaimedArr = [];
          // this.total = 0;
        }
        this.getClaims();
      })
      .catch(error => console.log(error));
    },
    async getUnclaimedWeeks() {
      const claimStatus = await this.claimStatus(this.address);
      this.unclaimedWeeks = Object.entries(claimStatus)
        .filter(status => !status[1])
        .map(status => status[0]);
    },
    async handleSubmit() {
      this.submitLoading = true;
      const weeks = [];
      console.log('unclaimedarr', this.unclaimedArr);
      this.unclaimedArr.forEach((item, index) => {
        weeks.push(Object.keys(item)[0]);
      });
      setTimeout(async () => {
        try {
          const tx = await this.claimWeeks({ address: this.address, weeks, reports: this.localReports });
          // console.log('TXTXTXTXTXTTXTXTXTXT', tx);
          await this.confirmClaims();
          this.submitLoading = false;
          this.txHash = tx.hash;
        } catch (e) {
          console.log('error', e);
          this.submitLoading = false;
        }
      }, 10);
    }
  }
};
</script>
