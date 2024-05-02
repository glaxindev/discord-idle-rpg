let allEvents = [
    { 
      description: 'You encounter a wounded beast on the path, its eyes pleading for help.', 
      options: ['Approach cautiously and attempt to heal it.', 'Ignore the creature and continue your journey.'],
      consequences: [
        { alignmentChange: 10, xpChange: 20 },
        { alignmentChange: -10, xpChange: 20, strengthChange: -7 }
      ],
      eventType: 'Exploration'
    },
    { 
      description: 'A mysterious scroll lies half-buried in the dirt, emanating a faint glow.', 
      options: ['Read the scroll and attempt to decipher its meaning.', 'Leave the scroll undisturbed.'],
      consequences: [
        { alignmentChange: 5, xpChange: 30 },
        { alignmentChange: 0, xpChange: 0, strengthChange: -7 }
      ],
      eventType: 'Exploration'
    },
    // Add more events here
    { 
      description: 'A celestial alignment occurs, granting temporary boons to those who embrace its energy.', 
      options: ['Meditate and channel the celestial energy.', 'Ignore the alignment and continue your journey.'],
      consequences: [
        { alignmentChange: 15, xpChange: 30 },
        { alignmentChange: -5, xpChange: 10, strengthChange: -3 }
      ],
      eventType: 'Combat'
    },
    { 
      description: 'A rival cultivator challenges you to a battle of wits, seeking to test your resolve.', 
      options: ['Accept the challenge and engage in a battle of wits.', 'Decline the challenge and walk away.'],
      consequences: [
        { alignmentChange: 10, xpChange: 10 },
        { alignmentChange: -10, xpChange: 10, strengthChange: -4 }
      ],
      eventType: 'Combat'
    },
    { 
      description: 'A mysterious figure offers you a forbidden elixir, promising untold power in exchange for a price.', 
      options: ['Accept the elixir and embrace its power.', 'Refuse the elixir and walk away.'],
      consequences: [
        { alignmentChange: -10, xpChange: 20 },
        { alignmentChange: 5, xpChange: 10, strengthChange: -5 }
      ],
      eventType: 'Gathering'
    },
    { 
      description: 'A hidden treasure chest lies in the shadows, waiting to be discovered by a brave adventurer.', 
      options: ['Open the chest and claim its contents.', 'Leave the chest undisturbed.'],
      consequences: [
        { alignmentChange: 5, xpChange: 10 },
        { alignmentChange: 0, xpChange: 0, strengthChange: -7 }
      ],
      eventType: 'Exploration'
    },
    { 
      description: 'A powerful storm descends upon the land, threatening to destroy everything in its path.', 
      options: ['Brace yourself and weather the storm.', 'Seek shelter and wait for the storm to pass.'],
      consequences: [
        { alignmentChange: 0, xpChange: 10 },
        { alignmentChange: 0, xpChange: 0, strengthChange: -7 }
      ],
      eventType: 'Exploration'
    },
    { 
      description: 'A mysterious portal opens before you, leading to an unknown realm beyond.', 
      options: ['Step through the portal and explore the unknown realm.', 'Ignore the portal and continue your journey.'],
      consequences: [
        { alignmentChange: 10, xpChange: 10 },
        { alignmentChange: -10, xpChange: 0, strengthChange: -7 }
      ],
      eventType: 'Exploration'
    },
    { 
      description: 'A wise sage offers you a chance to glimpse into the future, revealing the path that lies ahead.', 
      options: ['Accept the sage\'s offer and peer into the future.', 'Decline the sage\'s offer and forge your own path.'],
      consequences: [
        { alignmentChange: 5, xpChange: 10 },
        { alignmentChange: 0, xpChange: 0, strengthChange: -7 }
      ],
      eventType: 'Combat'
    },
    { 
      description: 'A mysterious figure offers you a chance to rewrite your past, erasing your mistakes and starting anew.', 
      options: ['Accept the figure\'s offer and rewrite your past.', 'Decline the figure\'s offer and embrace your mistakes.'],
      consequences: [
        { alignmentChange: -10, xpChange: 20 },
        { alignmentChange: 5, xpChange: 0, strengthChange: -7 }
      ],
      eventType: 'Combat'
    },
    { 
      description: 'A hidden treasure chest lies in the shadows, waiting to be discovered by a brave adventurer.', 
      options: ['Open the chest and claim its contents.', 'Leave the chest undisturbed.'],
      consequences: [
        { alignmentChange: 5, xpChange: 10 },
        { alignmentChange: 0, xpChange: 0, strengthChange: -7 }
      ],
      eventType: 'Exploration'
    },
    { 
      description: 'A powerful storm descends upon the land, threatening to destroy everything in its path.', 
      options: ['Brace yourself and weather the storm.', 'Seek shelter and wait for the storm to pass.'],
      consequences: [
        { alignmentChange: 0, xpChange: 10 },
        { alignmentChange: 0, xpChange: 0, strengthChange: -7 }
      ],
      eventType: 'Exploration'
    },
    { 
      description: 'A mysterious portal opens before you, leading to an unknown realm beyond.', 
      options: ['Step through the portal and explore the unknown realm.', 'Ignore the portal and continue your journey.'],
      consequences: [
        { alignmentChange: 10, xpChange: 10 },
        { alignmentChange: -10, xpChange: 0, strengthChange: -7 }
      ],
      eventType: 'Exploration'
    },
    { 
      description: 'A wise sage offers you a chance to glimpse into the future, revealing the path that lies ahead.', 
      options: ['Accept the sage\'s offer and peer into the future.', 'Decline the sage\'s offer and forge your own path.'],
      consequences: [
        { alignmentChange: 5, xpChange: 10 },
        { alignmentChange: 0, xpChange: 0, strengthChange: -5 }
      ],
      eventType: 'Combat'
    },
    { 
      description: 'A mysterious figure offers you a chance to rewrite your past, erasing your mistakes and starting anew.', 
      options: ['Accept the figure\'s offer and rewrite your past.', 'Decline the figure\'s offer and embrace your mistakes.'],
      consequences: [
        { alignmentChange: -10, xpChange: 30 },
        { alignmentChange: 5, xpChange: 0, strengthChange: -2 }
      ],
      eventType: 'Combat'
    },
    { 
      description: 'A hidden treasure chest lies in the shadows, waiting to be discovered by a brave adventurer.', 
      options: ['Open the chest and claim its contents.', 'Leave the chest undisturbed.'],
      consequences: [
        { alignmentChange: 5, xpChange: 30 },
        { alignmentChange: 0, xpChange: 0, strengthChange: -7 }
      ],
      eventType: 'Exploration'
    },
    { 
      description: 'A powerful storm descends upon the land, threatening to destroy everything in its path.', 
      options: ['Brace yourself and weather the storm.', 'Seek shelter and wait for the storm to pass.'],
      consequences: [
        { alignmentChange: 0, xpChange: 30 },
        { alignmentChange: 0, xpChange: 0, strengthChange: -7 }
      ],
      eventType: 'Exploration'
    },
    { 
      description: 'A mysterious portal opens before you, leading to an unknown realm beyond.', 
      options: ['Step through the portal and explore the unknown realm.', 'Ignore the portal and continue your journey.'],
      consequences: [
        { alignmentChange: 10, xpChange: 20 },
        { alignmentChange: -10, xpChange: 0, strengthChange: -7 }
      ],
      eventType: 'Gathering'
    },
    { 
      description: 'A wise sage offers you a chance to glimpse into the future, revealing the path that lies ahead.', 
      options: ['Accept the sage\'s offer and peer into the future.', 'Decline the sage\'s offer and forge your own path.'],
      consequences: [
        { alignmentChange: 5, xpChange: 20 },
        { alignmentChange: 0, xpChange: 0, strengthChange: -7 }
      ],
      multiStep: true,
      eventType: 'Combat'
    },
    { 
      description: 'A mysterious figure offers you a chance to rewrite your past, erasing your mistakes and starting anew.', 
      options: ['Accept the figure\'s offer and rewrite your past.', 'Decline the figure\'s offer and embrace your mistakes.'],
      consequences: [
        { alignmentChange: -10, xpChange: 20 },
        { alignmentChange: 5, xpChange: 0, strengthChange: -5 }
      ],
      multiStep: true,
      eventType: 'Combat'
    },
    { 
      description: 'A hidden treasure chest lies in the shadows, waiting to be discovered by a brave adventurer.', 
      options: ['Open the chest and claim its contents.', 'Leave the chest undisturbed.'],
      consequences: [
        { alignmentChange: 5, xpChange: 10 },
        { alignmentChange: 0, xpChange: 0, strengthChange: -7 }
      ],
      multiStep: true,
      eventType: 'Exploration'
    },
    {
      description: 'A powerful storm descends upon the land, threatening to destroy everything in its path.',
      options: ['Brace yourself and weather the storm.', 'Seek shelter and wait for the storm to pass.'],
      multiStep: true,
      consequences: [
        { alignmentChange: 0, xpChange: 20 },
        { alignmentChange: 0, xpChange: 0, strengthChange: -7 }
      ],
      eventType: 'Exploration'
    }
  ];

module.exports = allEvents;