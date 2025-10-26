// Motivational Quotes Database
// Organized by context categories for intelligent display

export const quotes = {
  morning: [
    {
      text: "The way to get started is to quit talking and begin doing.",
      author: "Walt Disney"
    },
    {
      text: "Every morning we are born again. What we do today matters most.",
      author: "Buddha"
    },
    {
      text: "When you arise in the morning, think of what a precious privilege it is to be alive—to breathe, to think, to enjoy, to love.",
      author: "Marcus Aurelius"
    },
    {
      text: "The secret of getting ahead is getting started.",
      author: "Mark Twain"
    },
    {
      text: "Each morning we are born again. Today is your opportunity to build the tomorrow you want.",
      author: "Unknown"
    },
    {
      text: "Yesterday is gone. Tomorrow has not yet come. We have only today. Let us begin.",
      author: "Mother Teresa"
    },
    {
      text: "The sun himself is weak when he first rises, and gathers strength and courage as the day gets on.",
      author: "Charles Dickens"
    },
    {
      text: "Lose an hour in the morning, and you will spend all day looking for it.",
      author: "Richard Whately"
    },
    {
      text: "Morning is when I am awake and there is a dawn in me.",
      author: "Henry David Thoreau"
    },
    {
      text: "The first hour of the morning is the rudder of the day.",
      author: "Henry Ward Beecher"
    }
  ],
  
  working: [
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs"
    },
    {
      text: "Concentrate every minute like a Roman—like a man—on doing what's in front of you with precise and genuine seriousness.",
      author: "Marcus Aurelius"
    },
    {
      text: "The most effective way to do it, is to do it.",
      author: "Amelia Earhart"
    },
    {
      text: "Deep work is the ability to focus without distraction on a cognitively demanding task.",
      author: "Cal Newport"
    },
    {
      text: "You don't have to be great to start, but you have to start to be great.",
      author: "Zig Ziglar"
    },
    {
      text: "The difference between who you are and who you want to be is what you do.",
      author: "Charles Duhigg"
    },
    {
      text: "Action is the foundational key to all success.",
      author: "Pablo Picasso"
    },
    {
      text: "Every action you take is a vote for the type of person you wish to become.",
      author: "James Clear"
    },
    {
      text: "Patience and persistence are vital qualities in the ultimate successful accomplishment of any worthwhile endeavor.",
      author: "Joseph Pilates"
    },
    {
      text: "The way to get started is to quit talking and begin doing.",
      author: "Walt Disney"
    }
  ],
  
  break: [
    {
      text: "Rest when you're weary. Refresh and renew yourself, your body, your mind, your spirit. Then get back to work.",
      author: "Ralph Marston"
    },
    {
      text: "Almost everything will work again if you unplug it for a few minutes, including you.",
      author: "Anne Lamott"
    },
    {
      text: "Take rest; a field that has rested gives a bountiful crop.",
      author: "Ovid"
    },
    {
      text: "In the midst of movement and chaos, keep stillness inside of you.",
      author: "Deepak Chopra"
    },
    {
      text: "Sometimes the most productive thing you can do is relax.",
      author: "Mark Black"
    },
    {
      text: "Your calm mind is the ultimate weapon against your challenges. So relax.",
      author: "Bryant McGill"
    },
    {
      text: "Rest is not idleness, and to lie sometimes on the grass under trees on a summer's day, listening to the murmur of the water, or watching the clouds float across the sky, is by no means a waste of time.",
      author: "John Lubbock"
    },
    {
      text: "There is virtue in work and there is virtue in rest. Use both and overlook neither.",
      author: "Alan Cohen"
    },
    {
      text: "The time you enjoy wasting is not wasted time.",
      author: "Bertrand Russell"
    },
    {
      text: "It is not enough to be busy; so are the ants. The question is: What are we busy about?",
      author: "Henry David Thoreau"
    }
  ],
  
  struggling: [
    {
      text: "The man who moves a mountain begins by carrying away small stones.",
      author: "Confucius"
    },
    {
      text: "What is to give light must endure burning.",
      author: "Viktor Frankl"
    },
    {
      text: "The obstacle is the way.",
      author: "Marcus Aurelius"
    },
    {
      text: "Man is something that shall be overcome. What have you done to overcome him?",
      author: "Friedrich Nietzsche"
    },
    {
      text: "The most beautiful people we have known are those who have known defeat, known suffering, known struggle, known loss, and have found their way out of the depths.",
      author: "Elisabeth Kübler-Ross"
    },
    {
      text: "If you are going through hell, keep going.",
      author: "Winston Churchill"
    },
    {
      text: "The cave you fear to enter holds the treasure you seek.",
      author: "Joseph Campbell"
    },
    {
      text: "It is not the mountain we conquer, but ourselves.",
      author: "Edmund Hillary"
    },
    {
      text: "Pain and suffering are always inevitable for a large intelligence and a deep heart.",
      author: "Fyodor Dostoevsky"
    },
    {
      text: "There is only one thing that I dread: not to be worthy of my sufferings.",
      author: "Fyodor Dostoevsky"
    }
  ],
  
  accomplished: [
    {
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill"
    },
    {
      text: "The distance between your dreams and reality is called action.",
      author: "Unknown"
    },
    {
      text: "Well done is better than well said.",
      author: "Benjamin Franklin"
    },
    {
      text: "You are never too old to set another goal or to dream a new dream.",
      author: "C.S. Lewis"
    },
    {
      text: "The only impossible journey is the one you never begin.",
      author: "Tony Robbins"
    },
    {
      text: "Success is the sum of small efforts repeated day in and day out.",
      author: "Robert Collier"
    },
    {
      text: "Don't watch the clock; do what it does. Keep going.",
      author: "Sam Levenson"
    },
    {
      text: "The expert in anything was once a beginner.",
      author: "Helen Hayes"
    },
    {
      text: "Victory belongs to the most persevering.",
      author: "Napoleon Bonaparte"
    },
    {
      text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
      author: "Nelson Mandela"
    }
  ]
};

// Helper function to get a random quote from a category
export function getRandomQuote(category) {
  const categoryQuotes = quotes[category] || quotes.working;
  const randomIndex = Math.floor(Math.random() * categoryQuotes.length);
  return categoryQuotes[randomIndex];
}

// Helper function to determine the appropriate category based on context
export function determineQuoteCategory(context) {
  const { hourOfDay, isBreakTime, hasCompletedTasksToday, hasNoTasks, recentlyCompletedTask } = context;
  
  // Priority 1: Break time
  if (isBreakTime) {
    return 'break';
  }
  
  // Priority 2: Recently accomplished something
  if (recentlyCompletedTask) {
    return 'accomplished';
  }
  
  // Priority 3: Struggling (no tasks or no completions)
  if (hasNoTasks || !hasCompletedTasksToday) {
    return 'struggling';
  }
  
  // Priority 4: Time-based
  if (hourOfDay >= 6 && hourOfDay < 11) {
    return 'morning';
  }
  
  // Default: Working hours
  return 'working';
}
