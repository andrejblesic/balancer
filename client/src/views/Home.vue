<template>
  <div class="pt-2">
    <Container :slim="true">
      <Block class="text-center py-4">
        <h1 class="mb-2">Claim BAL</h1>
        <form
          @submit.prevent="handleSubmit"
          style="max-width: 460px;"
          class="width-full text-center mx-auto"
        >
          <UiButton :class="!isValid && 'border-red'" class="mb-3 width-full">
            <input
              v-model.trim="input"
              type="text"
              class="input width-full text-center"
              placeholder="Your wallet address"
            />
          </UiButton>
          <UiButton
            :disabled="!input || !isValid"
            type="submit"
            class="px-6 button--submit"
          >
            Next
          </UiButton>
        </form>
      </Block>
    </Container>
    <div v-if="true">
      <Container>
        <h2 class="mb-3">Top 10 this week</h2>
      </Container>
      <Container :slim="true">
        <Block :slim="true">
          <div class="d-flex px-4 py-3 bg-gray-dark">
            <div v-text="'Address'" class="flex-auto" />
            <div v-text="'Amount'" />
          </div>
          <div>
            <div
              v-for="(item, index) in lastDist"
              :key="index"
              class="d-flex px-4 py-3 border-top text-white"
            >
              <div class="flex-auto">
                <User :address="item.liquidity_provider_address" />
              </div>
              <div>{{ $n(item.amount) }} BAL</div>
            </div>
          </div>
        </Block>
      </Container>
    </div>
  </div>
</template>

<script>
import { isAddress } from '@ethersproject/address';

export default {
  data() {
    return {
      input: '',
      lastDist: []
    };
  },
  created() {
    this.input = this.web3.account;
    // this.lastDist = Object.fromEntries(
    //   Object.entries(this.app.latestReport)
    //     .sort((a, b) => b[1] - a[1])
    //     .slice(0, 15)
    // );
  },
  mounted() {
    fetch(`${process.env.VUE_APP_IPFS_NODE}/get-top-list`)
    .then(res => res.json())
    .then(data => {
        console.log('home data: ', data);
        if (data.error) {
          console.error(data.error);
          return;
        }
        this.lastDist = data;
    });
  },
  watch: {
    'web3.account': function() {
      this.input = this.web3.account;
    }
  },
  computed: {
    isValid() {
      if (!this.input) return true;
      return isAddress(this.input);
    }
  },
  methods: {
    async handleSubmit() {
      this.$router.push({ name: 'user', params: { address: this.input } });
    }
  }
};
</script>
